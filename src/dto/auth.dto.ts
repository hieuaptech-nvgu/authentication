import type { Types } from 'mongoose'

export interface LoginDTO {
  email: string
  password: string
}

export interface RegisterDTO {
  username: string
  email: string
  password: string
}

export interface CreateRefreshTokenDTO {
  userId: Types.ObjectId
  token: string
  expiresAt: Date
}
