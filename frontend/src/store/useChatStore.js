import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import { useAuthStore } from './useAuthStore.js';
import toast from 'react-hot-toast'

export const useChatStore = create((set, get) => ({
    users: [],
    conversations: [],
    messages: [],
    selectedUser: null,
    isConversationsLoading: false,
    isUsersLoading: false,
    isMessagesLoading: false,
    activeConversationId: null,
    searchQuery: "",
    sideBarTab: "chats",
    composerText: "",
    isSoundEnabled: true,
    isSendingMedia: false,

    // HTTP Status Errors (Library Dependent):
    // Libraries like Axios treat 4xx and 5xx statuses (like 404 Not Found or 500 Server Error) as failures and will throw an error into your catch block automatically.
    // The native browser Fetch API does not throw an error for a 404 or 500 status. It considers any completed server transaction a success. For Fetch, you must manually check response.ok inside your try block and explicitly use the throw keyword to force it into the catch block
    getUsers: async () => {
        set({ isUsersLoading: true })

        try {
            const res = await axiosInstance.get("/messages/users")
            set((state) => ({
                users: res.data,
                selectedUser: state.selectedUser && res.data.some((user) => user._id === state.selectedUser._id ? state.selectedUser : null)
            }))    
        } 
        catch (error) {
            console.log("Error in getUsers", error.message)
        }
        finally{
            set({ isUsersLoading: false })
        }
    },

    getConversations: async () => {
        set({ isConversationsLoading: true })

        try {
            const res = await axiosInstance.get("/messages/conversations")
            set({ conversations: res.data })            
        } 
        catch (error) {
            console.log("Error in getConversations", error.message)
        }
        finally{
            set({ isConversationsLoading: false })
        }
    },

    getMessages: async (userId) => {
        if(!userId) return 
        set({ isMessagesLoading: true })

        try {
            const res = await axiosInstance.get(`/messages/${userId}`)
            set({ messages: res.data })    
        } 
        catch (error) {
            toast.error(error.response?.data?.message || "Failed to load message")
        }
        finally{
            set({ isMessagesLoading: false })
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get()
        if(!selectedUser) return false

        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData)
            set({ messages: [...messages, res.data], composerText: "" })
            get().getConversations()
            return true    
        } 
        catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message")
            return false
        }
    },

    subscribeToMessages: (userId) => {
        if(!userId) return

        const socket = useAuthStore.getState().socket
        if(!socket) return 

        socket.off("newMessage")   // optional (optimization)
        socket.on("newMessage", (newMessage) => {    // subscribe
            // if i am not the receiver don't do anything
            if(String(newMessage.senderId) !== String(userId)) return

            set({ messages: [...get().messages, newMessage] })
            get().getConversations()
        })
    },

    unsubscribeFromMessages: () => {    // when user logs out or not on the chat page 
        const socket = useAuthStore.getState().socket
        socket?.off("newMessage")   // unsubscribe
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),

    setActiveConversationId: (activeConversationId) => {
        set((state) => ({
            activeConversationId,
            selectedUser: 
                state.users.find((user) => user._id === activeConversationId) || 
                state.conversations.find((user) => user._id === activeConversationId) || 
                null,
            messages: activeConversationId? state.messages : []
        }))
    },

    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setSideBar: (sideBarTab) => set({ sideBarTab }),
    setComposerText: (composerText) => set({ composerText }),
    setSoundEnabled: (isSoundEnabled) => set({ isSoundEnabled }),

    sendTextMessage: async (conversationId) => {
        const messageText = get().composerText.trim()
        if(!conversationId || !messageText) return false

        return get().sendMessage({ text: messageText })
    },

    sendMediaMessage: async ({ conversationId, file }) => {
        if(!conversationId || !file) return false

        const formData = new FormData()
        formData.append("media", file)

        set({ isSendingMedia: true })
        
        try {
            return await get().sendMessage(formData)   
        } 
        finally{
            set({ isSendingMedia: false })
        }
    }
}))
