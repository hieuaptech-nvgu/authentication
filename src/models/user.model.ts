import { Schema, model } from 'mongoose'
import type { IUser } from '~/types/user.type.js'
import { UserStatus } from '~/types/user.type.js'

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    hashedPassword: { type: String, required: true },
    roles: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Role',
        required: true,
      },
    ],
    is_verified: { type: Boolean, default: false },
    email_verify_code: { type: String, default: null },
    email_verify_expires: { type: Date, default: null },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    failed_attempts: { type: Number, default: 0 },
    locked_until: { type: Date, default: null },
    last_login_at: { type: Date, default: null },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
)

export const UserModel = model<IUser>('User', userSchema)
