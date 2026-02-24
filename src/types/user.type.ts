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
  createdAt: Date
  updatedAt: Date
}
