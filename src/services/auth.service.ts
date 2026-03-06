import type { RegisterDTO, LoginDTO } from '../dto/auth.dto.js'
import userRepository from '~/repositories/user.repository.js'
import refreshtokenRepository from '~/repositories/refreshtoken.repository.js'
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

    const accessToken = Jwt.createAccessToken({ userId: userMatch._id.toString(), email: userMatch.email })
    const refreshToken = Jwt.createRefreshToken({ userId: userMatch._id.toString(), email: userMatch.email })

    await refreshtokenRepository.deleteByUserId(userMatch._id)

    await refreshtokenRepository.create({
      userId: userMatch._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    return {
      userMatch,
      accessToken,
      refreshToken,
    }
  }

  async logout(refreshToken: string){
    await refreshtokenRepository.deleteRefreshToken(refreshToken)
    return true
  }
}

export default new AuthService()
