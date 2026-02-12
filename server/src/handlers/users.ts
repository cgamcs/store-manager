import { Request, Response } from "express"
import User from "../models/User.model"

export const getUsers = async (req: Request, res: Response) => {
  try {
   const users = await User.findAll({
    attributes: {exclude: ["createdAt", "updatedAt"]},
    order: [["id", "ASC"]]
   })
    res.json({data: users}) 
  } catch (error) {
    console.log("Error al obtener los usuarios")
    console.error(error)
  }
}