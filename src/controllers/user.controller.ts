import type { Request, Response, NextFunction } from 'express'

class UserController {
  async test(req: Request, res: Response, next: NextFunction) {
    try {
      res.sendStatus(204)
    } catch (error) {
      next(error)
    }
  }
}

export default new UserController()
