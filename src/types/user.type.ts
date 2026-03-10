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
  status: UserStatus
  failed_attempts: number
  locked_until: Date | null
  last_login_at: Date | null
  is_verified: boolean
  email_verify_code: string
  email_verify_expires: Date
  createdAt: Date
  updatedAt: Date
}
