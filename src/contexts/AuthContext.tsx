import React, { createContext, useContext, useState, useEffect } from "react"
import { GoogleOAuthProvider, CredentialResponse } from "@react-oauth/google"

interface User {
  email: string
  name: string
  picture?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: () => void
  logout: () => void
  handleCredentialResponse: (response: CredentialResponse) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ""

interface AuthProviderInnerProps {
  children: React.ReactNode
}

function AuthProviderInner({ children }: AuthProviderInnerProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("authToken")
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const handleCredentialResponse = async (response: CredentialResponse) => {
    try {
      if (!response.credential) {
        console.error("No credential in response")
        return
      }

      // Decode JWT to get user info
      const base64Url = response.credential.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))

      const payload = JSON.parse(jsonPayload)
      
      const userData: User = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      }
      
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
      localStorage.setItem("authToken", response.credential)
    } catch (error) {
      console.error("Failed to process credential:", error)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("authToken")
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login: () => {}, // Not needed with GoogleLogin component
    logout,
    handleCredentialResponse,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive">
            Configuration Error
          </h2>
          <p className="mt-2 text-muted-foreground">
            VITE_GOOGLE_CLIENT_ID is not configured
          </p>
        </div>
      </div>
    )
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProviderInner>{children}</AuthProviderInner>
    </GoogleOAuthProvider>
  )
}
