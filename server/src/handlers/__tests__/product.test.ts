import request from "supertest"
import server from "../../server"

describe("POST /products", () => {
  it("should fail when required fields are missing", async () => {
    const res = await request(server).post('/products').send({})

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty("errors")
    expect(res.body.errors).toHaveLength(4)
  })

  it("should fail when price is equal or lower than 0", async () => {
    const res = await request(server).post('/products').send({
      "name": "Laptop - Testing",
      "price": 0
    })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty("errors")
    expect(res.body.errors).toHaveLength(1)
  })

  it("should fail when price is not a number and equal or lower than 0", async () => {
    const res = await request(server).post('/products').send({
      "name": "Laptop - Testing",
      "price": "hola"
    })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty("errors")
    expect(res.body.errors).toHaveLength(2)
  })

  it("should create a new product", async () => {
    const res = await request(server).post('/products').send({
      "name": "Laptop - Testing",
      "price": 5000
    })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty("data")
  })
})

describe("GET /products", () => {
  it("should check if /products endpoint is working", async () => {
    const res = await request(server).get('/products')
    expect(res.status).toBe(200)
    expect(res.status).not.toBe(404)
  })

  it("should retrieve all products", async () => {
    const res = await request(server).get('/products')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty("data")
    expect(res.body.data.length).toBeGreaterThan(0)

    expect(res.body).not.toHaveProperty("errors")
    expect(res.status).not.toBe(404)
  })
})

describe("GET /products/:id", () => {
  it("should return a 404 response for a non-exist products", async () => {
    const productId = 2000
    const res = await request(server).get(`/products/${productId}`)

    expect(res.status).toBe(404)
    expect(res.body.message).toBe("Producto no encontrado")
  })

  it("should check a valid ID in the URL", async () => {
    const res = await request(server).get('/products/hola')

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty("errors")
    expect(res.body.errors).toHaveLength(1)
    expect(res.body.errors[0].msg).toBe("El ID debe ser un número entero")
  })

  it("should get a JSON response for a single product", async () => {
    const res = await request(server).get('/products/1')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty("data")
  })
})