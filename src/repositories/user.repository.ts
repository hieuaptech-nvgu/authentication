import { UserModel } from '~/models/user.model.js'
import type { CreateUserDTO } from '~/dto/user/create.dto.js'
import type { Types } from 'mongoose'
import { UserStatus } from '~/types/user.type.js'

class UserRepository {
  async create(data: CreateUserDTO) {
    return await UserModel.create(data)
  }

  async findById(id: string) {
    return await UserModel.findById(id)
  }

  async findByEmail(email: string) {
    return await UserModel.findOne({ email })
  }

  async findByEmailOrUsername(email: string, username: string) {
    return await UserModel.findOne({
      $or: [{ email: email, username: username }],
    })
  }

  async softDeleteById(userId: string | Types.ObjectId) {
    return await UserModel.findByIdAndUpdate(
      userId,
      { status: UserStatus.INACTIVE, deleted_at: new Date() },
      { new: true },
    )
  }

  async restoreById(userId: string | Types.ObjectId) {
    return await UserModel.findByIdAndUpdate(userId, { status: UserStatus.ACTIVE, deleted_at: null }, { new: true })
  }

  async update(userId: string, data: Partial<any>) {
    return await UserModel.findByIdAndUpdate(userId, data, { new: true })
  }

  async findActiveById(userId: string | Types.ObjectId) {
    return await UserModel.findOne({ _id: userId, status: { $ne: UserStatus.INACTIVE } })
  }

  async increaseFailedAttempts(userId: string | Types.ObjectId, maxAttempts = 5, lockMinutes = 15) {
    const user = await UserModel.findById(userId)
    if (!user) return null

    if ([UserStatus.INACTIVE, UserStatus.LOCKED, UserStatus.SUSPENDED].includes(user.status)) {
      return user
    }

    const failedAttempts = (user.failed_attempts || 0) + 1
    let lockedUtil = user.locked_until

    if (failedAttempts >= maxAttempts) {
      lockedUtil = new Date(Date.now() + lockMinutes * 60 * 1000)
    }

    user.failed_attempts = failedAttempts
    user.locked_until = lockedUtil
    await user.save()
    return user
  }

  async restLoginAttempts(userId: string | Types.ObjectId) {
    const user = await UserModel.findById(userId)
    if (!user) return null

    user.failed_attempts = 0
    user.locked_until = null

    const nonActiveStatuses = [UserStatus.LOCKED, UserStatus.INACTIVE, UserStatus.SUSPENDED]

    if (nonActiveStatuses.includes(user.status)) {
      user.status = UserStatus.ACTIVE
    }

    await user.save()
    return user
  }

  async findByEmailWithPassword(email: string) {
    return await UserModel.findOne({ email }).select(
      '+hashedPassword email username roles is_verified failed_attempts locked_until',
    )
  }

  async lockAccount(userId: string | Types.ObjectId, until: Date | null = null) {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        status: UserStatus.LOCKED,
        locked_until: until,
      },
      { new: true },
    )

    return user
  }
}

// verifyEmail
// updateLastLogin
// resetLoginAttempts(userId: string)
// lockAccount(userId: string, until: Date)

export default new UserRepository()
