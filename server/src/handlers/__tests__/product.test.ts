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