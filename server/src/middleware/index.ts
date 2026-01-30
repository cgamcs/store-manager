import { Request, Response, NextFunction } from "express"
import { validationResult } from "express-validator"

export const handleInputErrors = (req: Request, res: Response, next: NextFunction) => {
  let errorss = validationResult(req)
  if(!errorss.isEmpty()) {
    return res.status(400).json({errors: errorss.array()})
  }

  next()
}