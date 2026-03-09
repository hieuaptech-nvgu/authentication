import jwt from '~/utils/jwt.js'
import type { Request, Response, NextFunction } from 'express'
import userRepository from '~/repositories/user.repository.js'

export const protectedRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access token is required' })
    }

    const token = authHeader.split(' ')[1]

    let decoded
    try {
      decoded = jwt.verifyAccessToken(token)
    } catch (error) {
      return res.status(403).json({ message: 'Invalid or expired token', error })
    }

    if (!decoded.userId) {
      return res.status(401).json({ message: 'Invalid token payload' })
    }

    const user = await userRepository.findById(decoded.userId)

    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    req.user = user

    next()
  } catch (error) {
    next(error)
  }
}
