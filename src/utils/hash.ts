import bcrypt from 'bcrypt'
const SALT_ROUNDS = 10

class HashUtils {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS)
  }

  async comparePassword(password: string, hashedPassord: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassord)
  }
}

export default new HashUtils()
