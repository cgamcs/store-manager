import { Router } from "express"
import { createProduct } from "./handlers/product"

const router = Router()

// Routing
router.get('/', (req, res) => {
    res.send("Desde get")
})

router.post('/', createProduct)

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