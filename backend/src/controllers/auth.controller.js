const checkAuth = async (req, res) => {
    try {
        if(!req.user){
            return res.status(401).json({ message: "Unauthorized" })
        }

        return res.status(200).json(req.user)
    } 
    catch (error) {
        console.error("Error in checkAuth controller:", error.message)
        return res.status(500).json({ message: "Internal server error" }) 
    }
}

export { checkAuth }