import request from "supertest"
import server from "../server"

describe("GET /", () => {
  it("should return a JSON message", async () => {
    const res = await request(server).get("/")

    expect(res.status).toBe(200)
    expect(res.body.message).toBe("Desde server.ts")
  })
})