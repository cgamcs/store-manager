import { Request, Response } from "express" // Nos da el tipado de Request y Response
import Product from "../models/Product.model"

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.create(req.body)
    res.json({data: product}) 
  } catch (error) {
    console.log("Error al crear el producto")
    console.error(error)
  }
}