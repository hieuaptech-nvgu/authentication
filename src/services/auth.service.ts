import type { RegisterDTO, LoginDTO } from '../dto/auth.dto.js'
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

    const userMatch = await userRepository.findByEmail(email)
    if (!userMatch) {
      throw new Error('Wrong username or password')
    }

    const isMatch = await HashUtils.comparePassword(password, userMatch.hashedPassword)
    if (!isMatch) {
      throw new Error('Wrong username or password')
    }

    if (!userMatch.is_verified) {
      throw new Error('Email not verified')
    }

    const payload = {
      userId: userMatch._id.toString(),
      email: userMatch.email,
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

    const newAccessToken = Jwt.createAccessToken({
      userId: session.userId.toString(),
    })

    return {
      accessToken: newAccessToken,
    }
  }
}

export default new AuthService()
