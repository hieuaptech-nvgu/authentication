import type { RegisterDTO, LoginDTO } from '../dto/auth.dto.js'
import "../models/role.model.js"
import "../models/permission.model.js"
import userRepository from '~/repositories/user.repository.js'
import refreshtokenRepository from '~/repositories/refreshtoken.repository.js'
import HashUtils from '../utils/hash.js'
import Jwt from '~/utils/jwt.js'
import { generateOtp } from '~/utils/generateOTP.js'
import EmailService from './email.service.js'

class AuthService {
  async register(data: RegisterDTO) {
    const { username, email, password } = data

    const existsUser = await userRepository.findByEmailOrUsername(username, email)
    if (existsUser) {
      throw new Error('User already exists')
    }

    const otp = generateOtp()
    const hashedOtp = await HashUtils.hashPassword(otp)

    const hashedPassword = await HashUtils.hashPassword(password)

    const newUser = await userRepository.create({
      username,
      email,
      hashedPassword,
      is_verified: false,
      email_verify_code: hashedOtp,
      email_verify_expires: new Date(Date.now() + 10 * 60 * 1000),
    })

    await EmailService.sendVerifyEmail(email, otp)

    return {
      id: newUser._id,
      email: newUser.email,
      username: newUser.username,
    }
  }

  async login(data: LoginDTO) {
    const { email, password } = data

    const userMatch = await userRepository.findByEmail(email).populate<{
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

    const permissions = userMatch.roles?.flatMap((role) => role.permissions.map((p) => p.slug))

    const isMatch = await HashUtils.comparePassword(password, userMatch.hashedPassword)
    if (!isMatch) {
      throw new Error('Invalid email or password')
    }

    if (!userMatch.is_verified) {
      throw new Error('Please verify your email')
    }

    const payload = {
      userId: userMatch._id.toString(),
      email: userMatch.email,
      permissions
    }

    const accessToken = Jwt.createAccessToken(payload)
    const refreshToken = Jwt.createRefreshToken(payload)

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

  async logout(refreshToken: string) {
    await refreshtokenRepository.deleteRefreshToken(refreshToken)
    return true
  }

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
      throw new Error('token has expired')
    }

    const user = await userRepository.findById(session.userId.toString()).populate<{
      roles: Array<{
        permissions: Array<{ slug: string }>
      }>
    }>({
      path: 'roles',
      populate: { path: 'permissions' },
    })

    if (!user || !user.is_verified) {
      throw new Error('User not found or not verified')
    }

    const permissions = user.roles?.flatMap((role) => role.permissions.map((p) => p.slug)) || []

    const newAccessToken = Jwt.createAccessToken({
      userId: user._id.toString(),
      email: user.email,
      permissions: permissions
    })

    return {
      accessToken: newAccessToken,
    }
  }
}

export default new AuthService()
