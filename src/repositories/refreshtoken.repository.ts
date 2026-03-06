import { RefreshTokenModel } from '~/models/refreshtoken.model.js'
import type { CreateRefreshTokenDTO } from '~/dto/auth.dto.js'
import type { Types } from 'mongoose'

class RefreshTokenRepository {
  async create(data: CreateRefreshTokenDTO) {
    return RefreshTokenModel.create(data)
  }

  async deleteByUserId(userId: Types.ObjectId) {
    return RefreshTokenModel.deleteMany({ userId })
  }

  async deleteRefreshToken(token: string) {
    return RefreshTokenModel.deleteOne({ token })
  }

  async findByToken(token: string) {
    return RefreshTokenModel.findOne({ token })
  }
}

export default new RefreshTokenRepository()
