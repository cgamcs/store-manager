import { Request, Response } from "express" // Nos da el tipado de Request y Response
import { validationResult } from "express-validator"
import Product from "../models/Product.model"

export const createProduct = async (req: Request, res: Response) => {
  let errorss = validationResult(req)
  if(!errorss.isEmpty()) {
    return res.status(400).json({errors: errorss.array()})
  }

  const product = await Product.create(req.body)

  res.json({data: product})
}