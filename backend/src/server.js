import express from 'express'
import cors from 'express'
import "dotenv/config"
import { connectDB } from './lib/db.js'
import { clerkMiddleware } from '@clerk/express'

const app = express()
const PORT = process.env.PORT
const FRONTEND_URL = process.env.FRONTEND_URL

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({ origin: FRONTEND_URL, credentials: true} ))
app.use(clerkMiddleware())

app.listen(3000, () => {
    connectDB()
    console.log(`Server is listening at http://localhost:${PORT}`)
})
