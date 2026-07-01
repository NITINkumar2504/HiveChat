import { useWallpaper } from "../context/wallpaper.js"
import { useChatStore } from "../store/useChatStore.js"
import { useSelectedConversation } from "../hooks/useSelectedConversation.js" 
import { useEffect } from "react"
import ChatSideBar from "../components/chat/ChatSideBar.jsx"
import ChatHeader from "../components/chat/ChatHeader.jsx"
import MessageList from "../components/chat/MessageList.jsx"
import ChatComposer from "../components/chat/ChatComposer.jsx"

const ChatPage = () => {
  const { frameStyle } = useWallpaper()
  const getConversations = useChatStore(state => state.getConversations)
  const getMessages = useChatStore(state => state.getMessages)
  const getUsers = useChatStore(state => state.getUsers)
  const subscribeToMessages = useChatStore(state => state.subscribeToMessages)
  const unsubscribeFromMessages = useChatStore(state => state.unsubscribeFromMessages)

  const {activeConversation, activeConversationId, isLargeScreen} = useSelectedConversation()

  useEffect(() => {
    if(!activeConversationId) return

    getMessages(activeConversationId)
    subscribeToMessages(activeConversationId)

    // cleanup function
    return () => unsubscribeFromMessages()
  }, [getMessages, subscribeToMessages, unsubscribeFromMessages, activeConversationId])
  // The useEffect cleanup function runs under two main circumstances: right before the effect runs again (due to a change in the dependency array) and when the component unmounts (is removed from the screen)

  useEffect(() => {
    getUsers()
    getConversations()
  }, [getUsers, getConversations])

  return (
    <div className="flex h-dvh flex-col overflow-hidden p-2 sm:p-3 md:p-8" style={frameStyle}>
      <div className="mx-auto flex w-full max-w-6xl flex-1 overflow-hidden rounded-2xl border border-border bg-background text-foreground">
        <ChatSideBar/>

        <div className={`flex-1 flex-col overflow-hidden ${
            !isLargeScreen && !activeConversationId ? "hidden lg:flex" : "flex"
          }`}>
            <ChatHeader />
            <MessageList />

            {activeConversation ? <ChatComposer/> : null}
        </div>
      </div>
    </div>
  )
}

export default ChatPage
