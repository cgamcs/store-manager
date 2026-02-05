import { Router } from "express"
import { body, param } from "express-validator"
import { createProduct, deleteProduct, getProductById, getProducts, updateAvailability, updateProduct } from "./handlers/product"
import { handleInputErrors } from "./middleware"

const router = Router()
/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         id:
 *           type: integer
 *           description: Product ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Product name
 *           example: "Monitor"
 *         price:
 *           type: number
 *           description: Product price
 *           example: 150
 *         availability:
 *           type: boolean
 *           description: Product availability
 *           example: true
 *       example:
 *         id: 1
 *         name: "Monitor"
 *         price: 150
 *         availability: true
 */

// Routing
/**
 * @swagger
 * /products:
 *  get:
 *    summary: Get a list of products
 *    tags:
 *      - Products
 *    description: Return a list of products
 *    responses:
 *      200:
 *        description: Successful response
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Product'
 */
router.get("/", getProducts)

/**
 * @swagger
 * /products/{id}:
 *  get:
 *    summary: Get a product by ID
 *    tags:
 *      - Products
 *    description: Return a single product base on it's unique ID
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: The product ID
 *        schema:
 *          type: integer
 *    responses:
 *      200:
 *        description: Successful response
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Product'
 *      400:
 *        description: Invalid ID supplied
 *      404:
 *        description: Product not found
 */
router.get(
  "/:id",
  param("id").isInt().withMessage("El ID debe ser un número entero"),
  handleInputErrors,
  getProductById,
)

/**
 * @swagger
 * /products:
 *  post:
 *    summary: Create a new product
 *    tags:
 *      - Products
 *    description: Return a new record in the data base
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                trype: string
 *                example: "Laptop"
 *              price:
 *                trype: number
 *                example: 300
 *    responses:
 *      201:
 *        description: Successful record
 *      400:
 *        description: Invalid input data
 */
router.post(
  "/",
  // Validar los datos recibidos
  body("name").notEmpty().withMessage("El nombre es obligatorio"),
  body("price")
    .isNumeric()
    .withMessage("El precio debe ser un número")
    .notEmpty()
    .withMessage("El precio es obligatorio")
    .custom((value) => value > 0)
    .withMessage("El precio debe ser mayor a 0"),
  handleInputErrors,
  createProduct,
)

/**
 * @swagger
 * /products/{id}:
 *  put:
 *    summary: Update a product with user input
 *    tags:
 *      - Products
 *    description: Return a updated prodcut
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: The product ID
 *        schema:
 *          type: integer
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                trype: string
 *                example: "Laptop"
 *              price:
 *                trype: number
 *                example: 300
 *              availability:
 *                type: boolean
 *                example: true
 *    responses:
 *      200:
 *        description: Successful response
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Product'
 *      400:
 *        description: Invalid ID or invalid input data
 *      404:
 *        description: Product not found
 */
router.put(
  "/:id",
  param("id").isInt().withMessage("El ID debe ser un número entero"),
  body("name").notEmpty().withMessage("El nombre es obligatorio"),
  body("price")
    .isNumeric()
    .withMessage("El precio debe ser un número")
    .notEmpty()
    .withMessage("El precio es obligatorio")
    .custom((value) => value > 0)
    .withMessage("El precio debe ser mayor a 0"),
  body("availability")
    .isBoolean()
    .withMessage("La disponibilidad debe ser un valor booleano"),
  handleInputErrors,
  updateProduct,
)

/**
 * @swagger
 * /products/{id}:
 *  patch:
 *   summary: Update product availability
 *   tags:
 *       - Products
 *   description: Return a updated prodcut availability
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       description: The product ID
 *       schema:
 *         type: integer
 *   responses:
 *     200:
 *       description: Successful response
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     400:
 *       description: Invalid ID
 *     404:
 *       description: Product not found
 */
router.patch(
  "/:id",
  param("id").isInt().withMessage("El ID debe ser un número entero"),
  handleInputErrors,
  updateAvailability,
)

/**
 * @swagger
 * /products/{id}:
 *  delete:
 *    summary: Delete a product
 *    tags:
 *      - Products
 *    description: Return a updated prodcut
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: The product ID
 *        schema:
 *          type: integer
 *    responses:
 *      200:
 *        description: Succseful response
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                data:
 *                  trype: string
 *                  example: "Producto eliminado"
 *      400:
 *        description: Invalid ID
 *      404:
 *        description: Product not found
 */
router.delete(
  "/:id",
  param("id").isInt().withMessage("El ID debe ser un número entero"),
  handleInputErrors,
  deleteProduct,
)

export default router