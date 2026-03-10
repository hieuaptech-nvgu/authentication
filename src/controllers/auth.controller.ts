import type { Request, Response, NextFunction } from 'express'
import type { LoginDTO, RegisterDTO } from '~/dto/auth.dto.js'
import AuthService from '~/services/auth.service.js'
import EmailService from '~/services/email.service.js'

class AuthController {
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, code } = req.body

      const result = await EmailService.verifyEmail(email, code)

      return res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessToken, refreshToken } = await AuthService.login(req.body as LoginDTO)
      res.cookie('refreshtoken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      res.status(200).json({ message: `User is logged in`, accessToken })
    } catch (error) {
      next(error)
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.register(req.body as RegisterDTO)
      res.status(201).json({ message: 'User created successful', user })
    } catch (error) {
      next(error)
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshtoken
      if (token) {
        await AuthService.logout(token)
        res.clearCookie('refreshtoken', {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
        })
      }
      res.status(200).json({ messenger: 'Logout successful' })
    } catch (error) {
      next(error)
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshtoken
      if (!token) {
        return res.status(401).json({ message: 'Token not found' })
      }
      const accessToken = await AuthService.refreshToken(token)
      res.status(200).json({
        message: 'Token refreshed',
        accessToken,
      })
    } catch (error) {
      next(error)
    }
  }
}

export default new AuthController()
