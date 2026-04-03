import { UserModel } from '~/models/user.model.js'
import type { CreateUserDTO } from '~/dto/user/create.dto.js'
import type { ClientSession, Types } from 'mongoose'

class UserRepository {
  async create(data: CreateUserDTO, options?: { session: ClientSession }) {
    const user = await UserModel.create([data], options)
    return user[0]
  }

  findById(id: string) {
    return UserModel.findById(id)
  }

  deleteById(id: string | Types.ObjectId) {
    return UserModel.deleteOne({ _id: id })
  }

  findByEmail(email: string) {
    return UserModel.findOne({ email })
  }

  findByEmailOrUsername(email: string, username: string) {
    return UserModel.findOne({
      $or: [{ email }, { username }],
    })
  }

  update(userId: string, data: Partial<any>) {
    return UserModel.findByIdAndUpdate(userId, data, { new: true })
  }

  //   findById(id: string)
  // findByEmail(email: string)
  // create(data)
  // updateById(id, data)
  // increaseFailedAttempts(userId: string)
  // resetLoginAttempts(userId: string)
  // lockAccount(userId: string, until: Date)
}

export default new UserRepository()
