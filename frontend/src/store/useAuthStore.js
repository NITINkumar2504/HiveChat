import { create } from 'zustand'
import { axiosInstance } from '../lib/axios.js'
import { io } from 'socket.io-client'

const BASE_URL = import.meta.env.MODE === 'development' ? "http://localhost:3000" : "/" 
// it is for Socket.IO and is specifically about connecting to the backend server

const useAuthStore = create((set, get) => ({
    authUser: null,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        set({ isCheckingAuth: true })

        try {
            const res = await axiosInstance.get("/auth/check") 
            set({ authUser: res.data }) 
            get().connectSocket(res.data)   
        } 
        catch (error) {
            console.error("Error in checkAuth:", error.message)
            set({ authUser: null })
        }
        finally{
            set({ isCheckingAuth: false })
        }
    },

    clearAuth: () => {
        set({ authUser: null, isCheckingAuth: false, onlineUsers: [] })
        get().disconnectSocket()
    },

    connectSocket: (user) => {
        if(!user || get().socket?.connected) return   // if user is undefined or already connected

        const socket = io(BASE_URL, { query: { userId: user._id }})
        set({ socket })

        socket.on("getOnlineUsers", (userIds) => {   // receives from server
            set({ onlineUsers: userIds})
        })
    },

    disconnectSocket: () => {
        const socket = get().socket
        if(socket?.connected) socket.disconnect()
        set({ socket: null })
    },
}))

export { useAuthStore }