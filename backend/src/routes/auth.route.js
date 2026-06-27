import express from 'express'
import { checkAuth } from '../controllers/auth.controller.js'
import { protectedRoute } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.get("/check", protectedRoute, checkAuth)

export default router