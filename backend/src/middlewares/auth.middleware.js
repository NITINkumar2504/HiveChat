import { getAuth } from "@clerk/express";
import User from "../models/user.model.js";

const protectedRoute = async (req, res, next) => {
    try {
        const { userId } = getAuth(req)
        // The getAuth() helper retrieves authentication state from the request object. It returns the Auth object, which includes helpful authentication information like the user's ID, session ID, and Organization ID. It's also useful for protecting routes.
        
        if(!userId) return res.status(401).json({ error: "Unauthorized" })
            
        const user = await User.findOne({ clerkId: userId })
        if(!user) return res.status(404).json({ error: "User profile is not synced yet" })

        req.user = user
        next()
    } 
    catch (error) {
        console.error("Error in protectedRoute middleware:", error.message)
        return res.status(500).json({ message: "Internal server error" }) 
    }
}

export { protectedRoute }