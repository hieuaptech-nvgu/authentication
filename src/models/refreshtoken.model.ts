import { Schema, model } from 'mongoose'
import type { IRefreshToken } from '~/types/refresh-token.type.js'

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revoked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

export const RefreshTokenModel = model<IRefreshToken>('RefreshToken', refreshTokenSchema)
