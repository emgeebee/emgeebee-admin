import { LogOut, User } from "lucide-react"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/Button"
import { TokenList } from "@/components/TokenList"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"

function LoginPage() {
  const { login } = useAuth()

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
          <Button onClick={login} className="w-full" size="lg">
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </Button>
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
