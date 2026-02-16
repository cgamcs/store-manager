import { createBrowserRouter } from "react-router-dom"
import Layout from "./layouts/Layout"
import Dashboard from "./pages/Dashboard"
import Products, { loader as productsLoader, action as newProductAction } from "./pages/Products"
import { loader as editProductLoader, action as editProductAction } from "./components/products/EditProduct"
import { action as deleteProductAction } from "./components/products/ProductDetails"
import Categories from "./pages/Categories"
import Sales from "./pages/Sales"
import Users from "./pages/Users"
import Login from "./pages/Login"
import ChangePassword from "./pages/ChangePassword"
import SignUp from "./pages/SignUp"

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: 'productos',
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
      },
      {
        path: 'categorias',
        element: <Categories />
      },
      {
        path: 'ventas',
        element: <Sales />
      },
      {
        path: 'usuarios',
        element: <Users />
      },
    ]
  },
  {
    path: '/iniciar-sesion',
    element: <Login />
  },
  {
    path: '/registrarse',
    element: <SignUp />
  },
  {
    path: '/cambiar-contrasena',
    element: <ChangePassword />
  },
])