import { UserModel } from '~/models/user.model.js'
import type { CreateUserDTO } from '~/dto/user/create.dto.js'

class UserRepository {
  create(data: CreateUserDTO) {
    return UserModel.create(data)
  }

  findById(id: string) {
    return UserModel.findById(id)
  }

  findByEmail(email: string) {
    return UserModel.findOne({ email })
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
