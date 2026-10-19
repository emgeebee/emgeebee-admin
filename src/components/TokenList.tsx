import { useState, useEffect } from "react"
import { Plus, Trash2, AlertCircle, Key, Copy, Check } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/Button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card"
import { tokenApi, ApiError } from "@/services/api"
import type { Token } from "@/types/token"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/Dialog"

function TokenDisplay({ token }: { token: string }) {
  const [copied, setCopied] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const maskedToken = `${token.slice(0, 12)}...${token.slice(-12)}`

  return (
    <div className="flex items-center gap-2 rounded-md bg-muted p-3">
      <code className="flex-1 select-all text-sm font-mono break-all">
        {revealed ? token : maskedToken}
      </code>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setRevealed(!revealed)}
      >
        {revealed ? "Hide" : "Show"}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={copyToClipboard}
        disabled={copied}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copy
          </>
        )}
      </Button>
    </div>
  )
}

function NewTokenDialog({
  open,
  onOpenChange,
  token,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: Token | null
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>Token Created Successfully</DialogTitle>
          <DialogDescription>
            Make sure to copy your token now. You won't be able to see it again!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {token && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Token</label>
                <div className="rounded-md bg-muted p-4">
                  <code className="block select-all break-all text-sm font-mono">
                    {token.token}
                  </code>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <p className="font-medium">
                    {format(new Date(token.createdAt), "PPp")}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Expires:</span>
                  <p className="font-medium">
                    {format(new Date(token.expiresAt), "PPp")}
                  </p>
                </div>
              </div>
            </>
          )}
          <Button onClick={() => onOpenChange(false)} className="w-full">
            I've saved my token
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function TokenList() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newToken, setNewToken] = useState<Token | null>(null)
  const [showNewTokenDialog, setShowNewTokenDialog] = useState(false)

  const loadTokens = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await tokenApi.getAll()
      setTokens(data)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Failed to load tokens")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTokens()
  }, [])

  const handleCreate = async () => {
    setIsCreating(true)
    setError(null)
    try {
      const token = await tokenApi.create()
      setNewToken(token)
      setShowNewTokenDialog(true)
      await loadTokens()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to create token"
      setError(message)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (token: string) => {
    if (confirm("Are you sure you want to expire this token? This action cannot be undone.")) {
      try {
        await tokenApi.delete(token)
        await loadTokens()
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Failed to delete token"
        alert(message)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Loading tokens...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">API Tokens</h2>
          <p className="text-muted-foreground">
            Manage your long-lived API tokens
          </p>
        </div>
        <Button onClick={handleCreate} disabled={isCreating}>
          <Plus className="h-4 w-4" />
          {isCreating ? "Creating..." : "Generate Token"}
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-2 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </CardContent>
        </Card>
      )}

      {tokens.length === 0 && !error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Key className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No tokens yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Generate your first API token to get started
            </p>
            <Button onClick={handleCreate} disabled={isCreating}>
              <Plus className="h-4 w-4" />
              {isCreating ? "Creating..." : "Generate Token"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tokens.map((token) => (
            <Card key={token.token}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">Token</CardTitle>
                    <CardDescription>
                      Created {format(new Date(token.createdAt), "PPp")}
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(token.token)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <TokenDisplay token={token.token} />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <p className="font-medium">
                      {format(new Date(token.createdAt), "PPp")}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expires:</span>
                    <p className="font-medium">
                      {format(new Date(token.expiresAt), "PPp")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <NewTokenDialog
        open={showNewTokenDialog}
        onOpenChange={setShowNewTokenDialog}
        token={newToken}
      />
    </div>
  )
}
