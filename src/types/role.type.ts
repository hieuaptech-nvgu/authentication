import type { Types } from 'mongoose'

export interface IRole {
  name: string
  description?: string
  permissions: Types.ObjectId[]
  is_system_role: boolean
  createdAt: Date
  updatedAt: Date
}
