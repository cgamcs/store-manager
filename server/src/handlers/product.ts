import { Request, Response } from "express" // Nos da el tipado de Request y Response

export const createProduct = (req: Request, res: Response) => {
  res.send("Product created")
}