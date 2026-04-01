import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
dotenv.config()
const app = express()
import { connectDB } from './config/db.js'
import authRoute from './routes/auth.route.js'
import userRoute from './routes/user.route.js'

const corsOptions: cors.CorsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Cho phép gửi cookie/token qua CORS
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())
connectDB()

app.use('/api/auth', authRoute)
app.use('/api/users', userRoute)

export default app
