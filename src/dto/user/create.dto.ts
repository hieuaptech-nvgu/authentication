export interface CreateUserDTO {
  username: string
  email: string
  hashedPassword: string
  email_verify_code?: string
  email_verify_expires?: Date
  is_verified?: boolean
}
