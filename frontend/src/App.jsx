import { useAuth } from "@clerk/react"
import { WallpaperProvider } from "./context/WallpaperContext"
import { ThemeProvider } from "./context/ThemeContext"
import { Navigate, Route, Routes } from "react-router"
import ChatPage from "./pages/ChatPage"
import AuthPage from "./pages/AuthPage"
import PageLoader from "./components/PageLoader"
import { useAuthStore } from "./store/useAuthStore"
import { useEffect } from "react"
import { Toaster } from 'react-hot-toast'

function App() {
  const { isSignedIn, isLoaded } = useAuth()

  // const { checkAuth, isCheckingAuth, clearAuth } = useAuthStore()
  const checkAuth = useAuthStore(state => state.checkAuth)
  const isCheckingAuth = useAuthStore(state => state.isCheckingAuth)
  const clearAuth = useAuthStore(state => state.clearAuth)

  useEffect(() => {
    if(!isLoaded) return    // clerk is not loaded

    if(isSignedIn) checkAuth()
    else clearAuth()
  }, [checkAuth, clearAuth, isLoaded, isSignedIn])

  if(!isLoaded || (isSignedIn && isCheckingAuth)) return <PageLoader />

  return (
    <ThemeProvider>
      <WallpaperProvider>
        <Routes>
          {/* changes the URL to /auth and replaces the current history entry so the user cannot press the "Back" button and get stuck in an unauthorized loop */}
          <Route path="/" element={isSignedIn ? <ChatPage /> : <Navigate to={"/auth"} replace />}/>  
          <Route path="/auth" element={!isSignedIn ? <AuthPage /> : <Navigate to={"/"} replace />}/>
        </Routes>
        <Toaster/>
      </WallpaperProvider>
    </ThemeProvider>
  )
}

export default App
