import { createBrowserRouter } from "react-router-dom"
import Layout from "./layouts/Layout"
import Products, { loader as productsLoader, action as newProductAction } from "@/pages/Products"
import { loader as editProductLoader, action as editProductAction } from "./components/EditProduct"
import { action as deleteProductAction } from "@/components/ProductDetails"

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Products />,
        loader: productsLoader
      },
      {
        path: 'productos/nuevo',
        action: newProductAction
      },
      {
        path: 'productos/:id/editar', // ROA pattern - Resource-oriented design
        loader: editProductLoader,
        action: editProductAction
      },
      {
        path: 'productos/:id/eliminar',
        action: deleteProductAction
      }
    ]
  }
])