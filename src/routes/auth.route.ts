import express from 'express'
const router = express.Router()
import AuthController from '~/controllers/auth.controller.js'


router.post('/register', AuthController.register)
router.post('/login', AuthController.login)
router.post('/logout', AuthController.logout)
router.post('/refresh-token', AuthController.refreshToken)

export default router
