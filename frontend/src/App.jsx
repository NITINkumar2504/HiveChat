import { useAuth } from "@clerk/react"
import { WallpaperProvider } from "./context/WallpaperContext"
import { ThemeProvider } from "./context/ThemeContext"
import { Navigate, Route, Routes } from "react-router"
import ChatPage from "./pages/ChatPage"
import AuthPage from "./pages/AuthPage"
import PageLoader from "./components/PageLoader"

function App() {
  const { isSignedIn, isLoaded } = useAuth()
  if(!isLoaded) return <PageLoader />

  return (
    <ThemeProvider>
      <WallpaperProvider>
        <Routes>
          {/* changes the URL to /auth and replaces the current history entry so the user cannot press the "Back" button and get stuck in an unauthorized loop */}
          <Route path="/" element={isSignedIn ? <ChatPage /> : <Navigate to={"/auth"} replace />}/>  
          <Route path="/auth" element={!isSignedIn ? <AuthPage /> : <Navigate to={"/"} replace />}/>
        </Routes>
      </WallpaperProvider>
    </ThemeProvider>
  )
}

export default App
