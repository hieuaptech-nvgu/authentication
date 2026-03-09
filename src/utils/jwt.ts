import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()
import type { JwtPayload } from '../types/payload.type.js'

const ACCESS_KEY = process.env.SECRET_ACCESS_KEY as string
const REFRESH_KEY = process.env.SECRET_REFRESH_KEY as string

class Jwt {
  createAccessToken(payload: JwtPayload) {
    return jwt.sign(payload, ACCESS_KEY, { expiresIn: '3m' })
  }
  createRefreshToken(payload: JwtPayload) {
    return jwt.sign(payload, REFRESH_KEY, { expiresIn: '7d' })
  }
  verifyAccessToken(token: string) {
    return jwt.verify(token, ACCESS_KEY) as JwtPayload
  }
  verifyRefreshToken(token: string) {
    return jwt.verify(token, REFRESH_KEY) as JwtPayload
  }
}

export default new Jwt()
