import express from 'express'
const router = express.Router()
import userController from '~/controllers/user.controller.js'

router.get('/test', userController.test)

export default router
