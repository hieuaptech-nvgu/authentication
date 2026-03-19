import type { Types } from 'mongoose'

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  LOCKED = 'locked',
}

export interface IUser {
  username: string
  email: string
  hashedPassword: string
  roles: Types.ObjectId[]
  status: UserStatus
  failed_attempts: number
  locked_until: Date | null
  last_login_at: Date | null
  is_verified: boolean
  email_verify_code: string | null
  email_verify_expires: Date | null
  createdAt: Date
  updatedAt: Date
}
