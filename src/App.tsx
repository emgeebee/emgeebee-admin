import { LogOut, User } from "lucide-react"
import { GoogleLogin } from "@react-oauth/google"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/Button"
import { TokenList } from "@/components/TokenList"

const APP_VERSION = __APP_VERSION__

function LoginPage() {
  const { handleCredentialResponse } = useAuth()

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-4 rounded-md border border-border bg-card p-5">
        <div className="space-y-1">
          <div className="flex items-baseline justify-between gap-2">
            <h1 className="text-lg font-semibold tracking-tight">Admin Portal</h1>
            <span className="font-mono text-xs text-muted-foreground">v{APP_VERSION}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Sign in with Google to manage API tokens
          </p>
        </div>
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleCredentialResponse}
            onError={() => {
              console.error("Login Failed")
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
      </div>
    </div>
  )
}

function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-3 py-2">
          <div className="flex min-w-0 items-baseline gap-2">
            <h1 className="truncate text-sm font-semibold tracking-tight">Admin Portal</h1>
            <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
              v{APP_VERSION}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt=""
                  className="h-6 w-6 rounded-full"
                />
              ) : (
                <User className="h-6 w-6 rounded-full bg-muted p-1" />
              )}
              <span className="hidden max-w-[10rem] truncate text-xs text-muted-foreground sm:inline">
                {user?.email}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-3 py-3">
        <TokenList />
      </main>
    </div>
  )
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
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
