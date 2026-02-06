import { safeParse } from "valibot"
import axios from "axios"
import { DraftProductSchema, ProductSchema, ProductsSchema, type Product } from "../types"
import { toast } from "sonner"

type ProductData = {
  [k: string]: FormDataEntryValue
}

export async function addProduct(data: ProductData) {
  try {
    const result = safeParse(DraftProductSchema, {
      name: data.name,
      price: +data.price
    })
    
    if(result.success) {
      const url = `${import.meta.env.VITE_API_URL}/products`
      await axios.post(url, {
        name: result.output.name,
        price: result.output.price
      })

      toast.success("Producto creado con éxito")
    } else {
      throw new Error('Datos no validos')
    }
  } catch (error) {
    console.error(error)
  }
}

export async function getProducts() {
  try {
    const url = `${import.meta.env.VITE_API_URL}/products`
    const { data } = await axios(url)
    const result = safeParse(ProductsSchema, data.data)
    if(result.success) {
      return result.output
    } else {
      throw new Error('Hubo un error con los datos')
    }
  } catch (error) {
    console.error(error)
  }
}

export async function getProductById(id: Product['id']) {
  try {
    const url = `${import.meta.env.VITE_API_URL}/products/${id}`
    const { data } = await axios(url)
    console.log(url)
    console.log(data)
    const result = safeParse(ProductSchema, data.data)
    console.log(result)
    if(result.success) {
      return result.output
    } else {
      throw new Error('Hubo un error con los datos')
    }
  } catch (error) {
    console.error(error)
  }
}