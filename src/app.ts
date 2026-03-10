import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
dotenv.config()
const app = express()
import { connectDB } from './config/db.js'
import authRoute from './routes/auth.route.js'
import userRoute from './routes/user.route.js'

app.use(express.json())
app.use(cookieParser())
connectDB()

app.use('/api/auth', authRoute)
app.use('/api/users', userRoute)

export default app
