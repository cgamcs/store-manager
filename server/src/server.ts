import express from "express"

const server  = express()

// Routing
server.get('/', (req, res) => {
    res.send("Desde get")
})

server.post('/', (req, res) => {
    res.send("Desde post")
})

server.put('/', (req, res) => {
    res.send("Desde put")
})

server.patch('/', (req, res) => {
    res.send("Desde patch")
})

server.delete('/', (req, res) => {
    res.send("Desde delete")
})

export default server