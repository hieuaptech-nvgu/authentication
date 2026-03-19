import { Schema, model } from 'mongoose'
import type { IPermission } from '~/types/permission.type.js'

const permissionSchema = new Schema<IPermission>(
  {
    name: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true, // 🔥 dùng để check trong code
    },

    module: {
      type: String,
      required: true, // ví dụ: users, posts, auth
    },

    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
)

export const PermissionModel = model<IPermission>('Permission', permissionSchema)
