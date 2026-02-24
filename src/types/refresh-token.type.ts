import type { Types } from 'mongoose'

export interface IRefreshToken {
  userId: Types.ObjectId
  token: string
  expiresAt: Date
  revoked: boolean
  createdAt: Date
  updatedAt: Date
}
