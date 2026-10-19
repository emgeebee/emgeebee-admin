import { useState, useEffect } from "react"
import { Plus, Trash2, Edit, AlertCircle, Key } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/Button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card"
import { TokenDialog } from "@/components/TokenDialog"
import { TokenDisplay } from "@/components/TokenDisplay"
import { tokenApi, ApiError } from "@/services/api"
import type { Token, CreateTokenRequest, UpdateTokenRequest } from "@/types/token"

export function TokenList() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingToken, setEditingToken] = useState<Token | undefined>(undefined)
  const [newToken, setNewToken] = useState<string | null>(null)

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

  const handleCreate = async (data: CreateTokenRequest) => {
    const token = await tokenApi.create(data)
    setNewToken(token.token)
    await loadTokens()
  }

  const handleUpdate = async (data: UpdateTokenRequest) => {
    if (editingToken) {
      await tokenApi.update(editingToken.id, data)
      await loadTokens()
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this token? This action cannot be undone.")) {
      try {
        await tokenApi.delete(id)
        await loadTokens()
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Failed to delete token"
        alert(message)
      }
    }
  }

  const openCreateDialog = () => {
    setEditingToken(undefined)
    setDialogOpen(true)
  }

  const openEditDialog = (token: Token) => {
    setEditingToken(token)
    setDialogOpen(true)
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
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          Create Token
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

      {newToken && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-lg">Token Created Successfully</CardTitle>
            <CardDescription>
              Make sure to copy your token now. You won't be able to see it again!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-muted p-4">
              <code className="block break-all text-sm font-mono">{newToken}</code>
            </div>
            <Button onClick={() => setNewToken(null)} variant="outline" className="w-full">
              I've saved my token
            </Button>
          </CardContent>
        </Card>
      )}

      {tokens.length === 0 && !error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Key className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No tokens yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Create your first API token to get started
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Create Token
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tokens.map((token) => (
            <Card key={token.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{token.name}</CardTitle>
                    {token.description && (
                      <CardDescription>{token.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(token)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(token.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
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
                  {token.expiresAt && (
                    <div>
                      <span className="text-muted-foreground">Expires:</span>
                      <p className="font-medium">
                        {format(new Date(token.expiresAt), "PPp")}
                      </p>
                    </div>
                  )}
                  {token.lastUsed && (
                    <div>
                      <span className="text-muted-foreground">Last used:</span>
                      <p className="font-medium">
                        {format(new Date(token.lastUsed), "PPp")}
                      </p>
                    </div>
                  )}
                  {token.scopes && token.scopes.length > 0 && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Scopes:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {token.scopes.map((scope: string) => (
                          <span
                            key={scope}
                            className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                          >
                            {scope}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TokenDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        token={editingToken}
        onSave={editingToken ? handleUpdate : handleCreate}
      />
    </div>
  )
}
