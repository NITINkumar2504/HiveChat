import { hasImageKitConfig, uploadChatMedia } from "../lib/imagekit.js"
import { getReceiverSocketId, io } from "../lib/socket.js"
import Message from "../models/message.model.js"
import User from "../models/user.model.js"

const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id

        const filteredUsers = await User.find({_id : {$ne : loggedInUserId}}).select("-clerkId")
        return res.status(200).json(filteredUsers)
    } 
    catch (error) {
        console.error("Error in getUsersForSidebar controller:", error.message)
        return res.status(500).json({ message: "Internal server error" })
    }
}

const getConversationsForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id

        const conversations = await Message.aggregate([
            // 1.keep only the messages I sent or received
            {
                $match: {
                    $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }]
                }
            },
            // 2.Collapse them into one row per chat partner, noting out latest message time
            {
                $group: {
                    // partner is the other person on the message (not me) 
                    _id: { $cond: [{ $eq: ["$senderId", loggedInUserId]}, "$receiverId", "$senderId"]},
                    lastMessageAt: { $max: "$createdAt"}
                }
            },
            // 3.Put the most recent conversations at the top
            {
                $sort: { lastMessageAt: -1}
            },
            // 4.Lookup each partner's user profile (comes back as an array)
            {
                $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user"}
            },
            // 5.Pull that profile out of array and make it a document
            {
                $replaceRoot: { newRoot: { $first: "$user" }}
            },
            // 6.Hide the private clerkId field from the result
            {
                $project: { clerkId: 0 }
            }
        ])

        return res.status(200).json(conversations)
    } 
    catch (error) {
        console.error("Error in getConversationsForSidebar controller:", error.message)
        return res.status(500).json({ message: "Internal server error" })
    }
}

const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params
        const myId = req.user._id

        const messages = await Message.find({ 
            $or: [
                {senderId: myId, receiverId: userToChatId},
                {senderId: userToChatId, receiverId: myId}
            ]
        }).sort({createdAt: 1})  // ascending order (latest at bottom)

        return res.status(200).json(messages)
    } 
    catch (error) {
        console.error("Error in getMessages controller:", error.message)
        return res.status(500).json({ message: "Internal server error" })
    }
}

const sendMessages = async (req, res) => {
    try {
        const { id: receiverId } = req.params
        const { text } = req.body
        const senderId = req.user._id

        let imageUrl
        let videoUrl

        if(req.file){
            if(!hasImageKitConfig()){
                return res.status(500).json({ error: "Media upload is not configured" })
            }

            const url = await uploadChatMedia(req.file)
            if(req.file.mimetype.startsWith("video/")) videoUrl = url
            else imageUrl = url
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            video: videoUrl,
            image: imageUrl
        })

        await newMessage.save()

        // realtime changes with socketio. Otherwise, client will have to reload to see changes
        const receiverSocketId = getReceiverSocketId(receiverId)
        if(receiverSocketId){   // only send the message in realtime if user is online
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }

        return res.status(201).json(newMessage)
    } 
    catch (error) {
        console.error("Error in sendMessages controller:", error.message)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export { getUsersForSidebar, getConversationsForSidebar, getMessages, sendMessages }