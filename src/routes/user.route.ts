import express from 'express'
const router = express.Router()
import userController from '~/controllers/user.controller.js'
import { protectedRoute } from '~/middlewares/auth.middleware.js'

router.get('/test', protectedRoute, userController.test)

export default router
