import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import "dotenv/config"
import { connectDB } from './lib/db.js'
import { clerkMiddleware } from '@clerk/express'
    import job from './lib/cron.js'
import clerkWebhook from './webhooks/clerk.webhook.js'
import authRoutes from './routes/auth.route.js'
import messageRoutes from './routes/message.route.js'
import { app, server } from './lib/socket.js'

const PORT = process.env.PORT
const FRONTEND_URL = process.env.FRONTEND_URL

const publicDir = path.join(process.cwd(), "public")

// it is important that you don't parse the webhook event data, it should be in the raw format
app.use("/api/webhooks/clerk", express.raw({ type: "application/json"}), clerkWebhook)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({ origin: FRONTEND_URL, credentials: true} ))
app.use(clerkMiddleware())

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)

// if the public directory exists, serve the static files (for production build)
if(fs.existsSync(publicDir)){
    app.use(express.static(publicDir))

    app.get("/{*any}", (req, res, next) => {
        res.sendFile(path.join(publicDir, "index.html"), (err) => next(err))
    })
}

server.listen(PORT, () => {
    connectDB()
    console.log(`Server is listening at http://localhost:${PORT}`)

    if(process.env.NODE_ENV === 'production'){
        job.start()
    }
})
