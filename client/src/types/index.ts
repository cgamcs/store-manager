import { object, string, number, type InferOutput, array } from "valibot"

export const DraftProductSchema = object({
  name: string(),
  price: number(),
  category: string(),
  stock: number(),
  status: string()
})

export const ProductSchema = object({
  id: number(),
  name: string(),
  price: number(),
  category: string(),
  stock: number(),
  status: string()
})

export const ProductsSchema = array(ProductSchema)
export type Product = InferOutput<typeof ProductSchema>