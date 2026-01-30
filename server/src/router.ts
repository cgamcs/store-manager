import { Router } from "express"
import { body } from "express-validator"
import { createProduct, getProducts } from "./handlers/product"
import { handleInputErrors } from "./middleware"

const router = Router()

// Routing
router.get('/productos',
  getProducts
)

router.post('/', 
  // Validar los datos recibidos
  body('name')
    .notEmpty()
    .withMessage('El nombre es obligatorio'),
  body('price')
    .isNumeric().withMessage('El precio debe ser un número')
    .notEmpty().withMessage('El precio es obligatorio')
    .custom(value => value > 0).withMessage('El precio debe ser mayor a 0'),
  handleInputErrors,
  createProduct
)

router.put('/', (req, res) => {
    res.send("Desde put")
})

router.patch('/', (req, res) => {
    res.send("Desde patch")
})

router.delete('/', (req, res) => {
    res.send("Desde delete")
})

export default router