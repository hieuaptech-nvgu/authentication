import { Schema, model } from 'mongoose'
import type { IUser } from '~/types/user.type.js'
import { UserStatus } from '~/types/user.type.js'

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    hashedPassword: { type: String, required: true },
    roles: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Role',
        default: [],
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

userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ username: 1 }, { unique: true })

userSchema.set('toJSON', {
  transform: (_, ret: Partial<IUser> & { __v?: number }) => {
    delete ret.hashedPassword
    delete ret.email_verify_code
    delete ret.email_verify_expires
    delete ret.failed_attempts
    delete ret.locked_until
    delete ret.__v
    return ret
  },
})

export const UserModel = model<IUser>('User', userSchema)
