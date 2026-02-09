import { safeParse, pipe, number, parse, transform, string } from "valibot"
import axios from "axios"
import { toast } from "sonner"
import { DraftProductSchema, ProductSchema, ProductsSchema, type Product } from "../types"

type ProductData = {
  [k: string]: FormDataEntryValue
}

export async function addProduct(data: ProductData) {
  try {
    const result = safeParse(DraftProductSchema, {
      name: data.name,
      price: +data.price,
      category: data.category,
      stock: +data.stock,
      status: data.status
    })
    
    if(result.success) {
      const url = `${import.meta.env.VITE_API_URL}/products`
      await axios.post(url, {
        name: result.output.name,
        price: result.output.price,
        category: result.output.category,
        stock: result.output.stock,
        status: result.output.status
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
    const result = safeParse(ProductSchema, data.data)
    if(result.success) {
      return result.output
    } else {
      throw new Error('Hubo un error con los datos')
    }
  } catch (error) {
    console.error(error)
  }
}

export async function updateProduct(data: ProductData, id: Product['id']) {
  try {
    const NumberSchema = pipe(string(), transform(Number), number())
    const result = safeParse(ProductSchema, {
      id,
      name: data.name,
      price: parse(NumberSchema, data.price),
      category: data.category,
      stock: parse(NumberSchema, data.stock),
      status: data.satatus
    })

    if(result.success) {
      const url = `${import.meta.env.VITE_API_URL}/products/${id}`
      await axios.put(url, result.output)
    }
  } catch (error) {
    console.error(error)
  }
}

export async function deleteProduct(id: Product['id']) {
  try {
    const url = `${import.meta.env.VITE_API_URL}/products/${id}`
    await axios.delete(url)
  } catch (error) {
    console.error(error)
  }
}