import express from 'express'

const server = express()

server.listen(3000, () => {
    console.log("[SERVER] => Running on http://localhost:3000")
})