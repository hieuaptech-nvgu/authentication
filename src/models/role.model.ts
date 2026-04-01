import { Schema, model } from 'mongoose'
import type { IRole } from '../types/role.type.js'

const roleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Permission',
      },
    ],
    is_system_role: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
)

export const RoleModel = model<IRole>('Role', roleSchema)
