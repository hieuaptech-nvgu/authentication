import mongoose from 'mongoose'

export const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not defined')
  }
  try {
    await mongoose.connect(MONGO_URI)
    console.log('mongoose connected')
  } catch (error) {
    console.log('mongoose connection failed: ', error)
    process.exit(1)
  }
}
