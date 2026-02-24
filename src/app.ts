import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
const app = express()
import { connectDB } from './config/db.js'

app.use(express.json())

connectDB()

export default app
