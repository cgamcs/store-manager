import { Request, Response } from "express" // Nos da el tipado de Request y Response
import Product from "../models/Product.model"

export const getProducts = async (req: Request, res: Response) => {
  try {
   const products = await Product.findAll({
    attributes: {exclude: ["availability", "createdAt", "updatedAt"]}
   })
    res.json({data: products}) 
  } catch (error) {
    console.log("Error al obtener los productos")
    console.error(error)
  }
}

export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const product = await Product.findByPk(id, {
      attributes: {exclude: ["availability","createdAt", "updatedAt"]}
    })

    if(!product) {
      return res.status(404).json({error: "Producto no encontrado"})
    }
    
    res.json({data: product})
  } catch (error) {
    console.log("Error al obtener el producto")
    console.error(error)
  }
}

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.create(req.body)
    res.status(201).json({data: product})
  } catch (error) {
    console.log("Error al crear el producto")
    console.error(error)
  }
}

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const product = await Product.findByPk(id)

    if(!product) {
      return res.status(404).json({error: "Producto no encontrado"})
    }

    await product.update(req.body)
    await product.save()

    res.json({data: product})
  } catch (error) {
    console.log("Error al actualizar el producto")
    console.error(error)
  }
}

export const updateAvailability = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const product = await Product.findByPk(id)

    if(!product) {
      return res.status(404).json({error: "Producto no encontrado"})
    }

    // Se invierte el valor de availability
    product.availability = !product.dataValues.availability
    await product.save()

    res.json({data: product})
  } catch (error) {
    console.log("Error al actualizar el producto")
    console.error(error)
  }
}

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const product = await Product.findByPk(id)

    if(!product) {
      return res.status(404).json({error: "Producto no encontrado"})
    }

    await product.destroy()

    res.json({data: "Producto eliminado"})
  } catch (error) {
    console.log("Error al eleminar el producto")
    console.error(error)
  }
}