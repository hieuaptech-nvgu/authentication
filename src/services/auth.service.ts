import type { RegisterDTO, LoginDTO } from '../dto/auth.dto.js'
import userRepository from '~/repositories/user.repository.js'
import HashUtils from '../utils/hash.js'
import Jwt from '~/utils/jwt.js'

class AuthService {
  async register(data: RegisterDTO) {
    const { username, email, password } = data
    const existsUser = await userRepository.findByEmailOrUsername(username, email)
    if (existsUser) {
      throw new Error('User already exists')
    }
    const hashedPassword = await HashUtils.hashPassword(password)

    const newUser = await userRepository.create({
      email,
      username,
      hashedPassword,
    })

    return newUser
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

    const accessToken = await Jwt.createAccessToken({ userId: userMatch._id.toString(), email: userMatch.email })
    const refreshToken = await Jwt.createRefreshToken({ userId: userMatch._id.toString(), email: userMatch.email })

    return {
      accessToken,
      refreshToken,
    }
  }
}

export default new AuthService()
