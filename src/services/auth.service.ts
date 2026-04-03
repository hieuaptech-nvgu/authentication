import type { RegisterDTO, LoginDTO } from '../dto/auth.dto.js'
import '../models/role.model.js'
import '../models/permission.model.js'
import userRepository from '~/repositories/user.repository.js'
import refreshtokenRepository from '~/repositories/refreshtoken.repository.js'
import HashUtils from '../utils/hash.js'
import Jwt from '~/utils/jwt.js'
import { generateOtp } from '~/utils/generateOTP.js'
import EmailService from './email.service.js'
import crypto from 'crypto'
import mongoose from 'mongoose'

class AuthService {
  // ================= REGISTER =================
  async register(data: RegisterDTO) {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      const { username, email, password } = data

      const emailNormalized = email.toLowerCase().trim()
      const existingUser = await userRepository.findByEmail(emailNormalized)
      if (existingUser) {
        throw new Error('Email already exists')
      }
      const otp = generateOtp()
      const hashedOtp = crypto
        .createHash('sha256')
        .update(otp + process.env.OTP_SECRET)
        .digest('hex')
      const hashedPassword = await HashUtils.hashPassword(password)

      const newUser = await userRepository.create(
        {
          username,
          email: emailNormalized,
          hashedPassword,
          is_verified: false,
          email_verify_code: hashedOtp,
          email_verify_expires: new Date(Date.now() + 5 * 60 * 1000),
        },
        { session },
      )

      await session.commitTransaction()

      try {
        await EmailService.sendVerifyEmail(emailNormalized, otp)
      } catch (error) {
        console.error('Send email failed:', error)
      }

      return newUser
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }

  // ================= LOGIN =================
  async login(data: LoginDTO) {
    const { email, password } = data

    const emailNormalized = email.toLowerCase().trim()

    const userMatch = await userRepository
      .findByEmail(emailNormalized)
      .select('+hashedPassword email username roles is_verified failed_attempts locked_until')

      .populate<{
        roles: Array<{
          permissions: Array<{ slug: string }>
        }>
      }>({
        path: 'roles',
        populate: { path: 'permissions' },
      })

    if (!userMatch) {
      throw new Error('Invalid email or password')
    }

    // check lock
    if (userMatch.locked_until && userMatch.locked_until > new Date()) {
      throw new Error('Account is temporarily locked')
    }

    const isMatch = await HashUtils.comparePassword(password, userMatch.hashedPassword)

    // sai password
    if (!isMatch) {
      userMatch.failed_attempts += 1

      if (userMatch.failed_attempts >= 5) {
        userMatch.locked_until = new Date(Date.now() + 15 * 60 * 1000)
      }

      await userMatch.save()

      throw new Error('Invalid email or password')
    }

    // verify email
    if (!userMatch.is_verified) {
      throw new Error('Please verify your email')
    }

    // success → reset
    userMatch.failed_attempts = 0
    userMatch.locked_until = null
    userMatch.last_login_at = new Date()

    await userMatch.save()

    // safe mapping
    const permissions = userMatch.roles?.flatMap((role) => role.permissions?.map((p) => p.slug) || []) || []

    // payload tối ưu (không nhét permissions nếu scale lớn)
    const payload = {
      userId: userMatch._id.toString(),
      email: userMatch.email,
      permissions,
    }

    const accessToken = Jwt.createAccessToken(payload)
    const refreshToken = Jwt.createRefreshToken(payload)

    // nên dùng transaction nếu production lớn
    await refreshtokenRepository.deleteByUserId(userMatch._id)

    await refreshtokenRepository.create({
      userId: userMatch._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    return {
      user: {
        id: userMatch._id,
        email: userMatch.email,
        username: userMatch.username,
      },
      accessToken,
      refreshToken,
    }
  }

  // ================= LOGOUT =================
  async logout(refreshToken: string) {
    await refreshtokenRepository.deleteRefreshToken(refreshToken)
    return true
  }

  // ================= REFRESH TOKEN =================
  async refreshToken(token: string) {
    let payload

    try {
      payload = Jwt.verifyRefreshToken(token)
    } catch {
      throw new Error('Invalid or expired refresh token')
    }

    const session = await refreshtokenRepository.findByToken(token)

    if (!session) {
      throw new Error('Invalid or expired refresh token')
    }

    if (payload.userId !== session.userId.toString()) {
      throw new Error('Invalid refresh token')
    }

    if (session.expiresAt < new Date()) {
      throw new Error('Token has expired')
    }

    const user = await userRepository.findById(session.userId.toString())

    if (!user || !user.is_verified) {
      throw new Error('User not found or not verified')
    }

    // rotate refresh token (QUAN TRỌNG)
    await refreshtokenRepository.deleteRefreshToken(token)

    const newPayload = {
      userId: user._id.toString(),
      email: user.email,
    }

    const newAccessToken = Jwt.createAccessToken(newPayload)
    const newRefreshToken = Jwt.createRefreshToken(newPayload)

    await refreshtokenRepository.create({
      userId: user._id,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }
  }
}

export default new AuthService()
