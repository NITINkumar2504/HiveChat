import express from 'express'
import { Server } from 'socket.io'
import http from 'http'

const app = express()
const server = http.createServer(app)

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173"
const io = new Server(server, { cors: { origin: [ allowedOrigin ] }})   // both express app and socket server

// online users map = {userId: socketId}
const userSocketMap = {}

function getReceiverSocketId(userId){
    return userSocketMap[userId]
}

// On the Server: The connection (built-in reserved event) event (or connect in some APIs) is emitted whenever a new client establishes a connection. It is used to initialize the socket and set up listeners for that specific client.
// On the Client: The equivalent event is called connect. It fires when the client successfully establishes a live connection to the server.
io.on("connection", (socket) => {   // client online
    const userId = socket.handshake.query.userId
    if(userId) userSocketMap[userId] = socket.id

    // io.emit() sends event to everyone - broadcast
    io.emit("getOnlineUsers", Object.keys(userSocketMap)) // custom event named 'getOnlineUsers'

    // socket.on is used to listen events
    socket.on("disconnect", () => {    // built-in reserved event, client offline
        if(userId) delete userSocketMap[userId]
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})

export { app, server, io, getReceiverSocketId }