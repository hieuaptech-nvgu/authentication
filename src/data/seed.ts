import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'
import { PermissionModel } from '../models/permission.model.js'
import { RoleModel } from '..//models/role.model.js'

const MONGO_URI = process.env.MONGO_URI!

// 🔥 seed permissions
const seedPermissions = async () => {
  const permissions = [
    { name: 'Create User', slug: 'users:create', module: 'users' },
    { name: 'Delete User', slug: 'users:delete', module: 'users' },
    { name: 'View Dashboard', slug: 'dashboard:view', module: 'dashboard' },
  ]

  for (const perm of permissions) {
    await PermissionModel.updateOne({ slug: perm.slug }, { $set: perm }, { upsert: true })
  }

  console.log('✅ Permissions seeded')
}

// 🔥 seed roles
const seedRoles = async () => {
  const allPermissions = await PermissionModel.find()

  const adminPermissions = allPermissions.map((p) => p._id)
  const userPermissions = allPermissions.filter((p) => p.slug === 'dashboard:view').map((p) => p._id)

  await RoleModel.updateOne(
    { name: 'ADMIN' },
    {
      name: 'ADMIN',
      is_system_role: true,
      permissions: adminPermissions,
    },
    { upsert: true },
  )

  await RoleModel.updateOne(
    { name: 'USER' },
    {
      name: 'USER',
      is_system_role: false,
      permissions: userPermissions,
    },
    { upsert: true },
  )

  console.log('✅ Roles seeded')
}

// 🔥 main function
const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI)

    console.log('🚀 Connected to DB')

    await seedPermissions()
    await seedRoles()

    console.log('🔥 Seeding done')

    process.exit(0)
  } catch (error) {
    console.error('❌ Seed error:', error)
    process.exit(1)
  }
}

seed()
