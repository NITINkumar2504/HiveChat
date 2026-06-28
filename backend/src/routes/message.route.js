import express from 'express'
import { getConversationsForSidebar, getMessages, getUsersForSidebar, sendMessages } from '../controllers/message.controller.js'
import { protectedRoute } from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/multer.middleware.js'

const router = express.Router()

router.get("/users", protectedRoute, getUsersForSidebar)
router.get("/conversations", protectedRoute, getConversationsForSidebar)
router.get("/:id", protectedRoute, getMessages)
router.post("/send/:id", protectedRoute, upload.single("media"), sendMessages)

export default router