import { Router } from "express"
import { body, param } from "express-validator"
import { createProduct, getProductById, getProducts, updateAvailability, updateProduct } from "./handlers/product"
import { handleInputErrors } from "./middleware"

const router = Router()

// Routing
router.get('/', getProducts)

router.get('/:id',
  param('id').isInt().withMessage('El ID debe ser un número entero'),
  handleInputErrors,
  getProductById
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

router.put('/:id', 
  param('id').isInt().withMessage('El ID debe ser un número entero'),
  body('name')
    .notEmpty()
    .withMessage('El nombre es obligatorio'),
  body('price')
    .isNumeric().withMessage('El precio debe ser un número')
    .notEmpty().withMessage('El precio es obligatorio')
    .custom(value => value > 0).withMessage('El precio debe ser mayor a 0'),
  body('availability').isBoolean().withMessage('La disponibilidad debe ser un valor booleano'),
  handleInputErrors,
  updateProduct
)

router.patch('/:id', updateAvailability)

router.delete('/', (req, res) => {
    res.send("Desde delete")
})

export default router