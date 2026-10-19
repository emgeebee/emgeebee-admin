import { LogOut, User } from "lucide-react"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/Button"
import { TokenList } from "@/components/TokenList"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { GoogleLogin } from "@react-oauth/google"

function LoginPage() {
  const { handleCredentialResponse } = useAuth()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl">Admin Portal</CardTitle>
          <CardDescription>
            Sign in with your Google account to manage API tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleCredentialResponse}
              onError={() => {
                console.error('Login Failed')
              }}
              useOneTap
              size="large"
              text="signin_with"
              shape="rectangular"
            />
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Only authorized Google accounts can access this portal
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold">Admin Portal</h1>
            <p className="text-sm text-muted-foreground">Token Management</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <User className="h-8 w-8 rounded-full bg-muted p-1.5" />
              )}
              <div className="hidden text-sm sm:block">
                <p className="font-medium">{user?.name}</p>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <TokenList />
      </main>
    </div>
  )
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return isAuthenticated ? <Dashboard /> : <LoginPage />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
