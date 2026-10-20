import { useState, useEffect } from "react"
import { Plus, Trash2, AlertCircle, Key, Copy, Check } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { tokenApi, ApiError } from "@/services/api"
import {
  forgetTokenName,
  rememberTokenName,
  withStoredNames,
} from "@/lib/tokenNames"
import type { CreateTokenResponse, Token } from "@/types/token"
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

  const maskedToken = `${token.slice(0, 8)}…${token.slice(-6)}`

  return (
    <div className="flex items-center gap-1 rounded border border-border bg-muted/50 px-2 py-1">
      <code className="flex-1 select-all truncate font-mono text-xs">
        {revealed ? token : maskedToken}
      </code>
      <Button size="sm" variant="ghost" onClick={() => setRevealed(!revealed)}>
        {revealed ? "Hide" : "Show"}
      </Button>
      <Button size="sm" variant="ghost" onClick={copyToClipboard} disabled={copied}>
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    </div>
  )
}

function CreateTokenDialog({
  open,
  onOpenChange,
  onCreate,
  isCreating,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (name: string) => void
  isCreating: boolean
}) {
  const [name, setName] = useState("")

  const close = () => {
    setName("")
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setName("")
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-w-sm p-4">
        <DialogClose onClose={close} />
        <DialogHeader>
          <DialogTitle>Generate token</DialogTitle>
          <DialogDescription>Give this token a name so you can tell it apart later.</DialogDescription>
        </DialogHeader>
        <form
          className="mt-3 space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (!name.trim()) return
            onCreate(name.trim())
          }}
        >
          <Input
            autoFocus
            placeholder="e.g. CI, laptop, staging"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isCreating}
            maxLength={64}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isCreating || !name.trim()}>
              {isCreating ? "Creating…" : "Generate"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function NewTokenDialog({
  open,
  onOpenChange,
  token,
  name,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: CreateTokenResponse | null
  name?: string
}) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    if (!token) return
    await navigator.clipboard.writeText(token.token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-4">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>Token created</DialogTitle>
          <DialogDescription>
            Copy it now — you won&apos;t be able to see the full value again.
          </DialogDescription>
        </DialogHeader>
        {token && (
          <div className="mt-3 space-y-3">
            {(name || token.name) && (
              <p className="text-sm">
                <span className="text-muted-foreground">Name: </span>
                <span className="font-medium">{name || token.name}</span>
              </p>
            )}
            <div className="rounded border border-border bg-muted/50 p-2">
              <code className="block select-all break-all font-mono text-xs">{token.token}</code>
            </div>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>Expires {format(new Date(token.expiresAt), "PP")}</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copyToClipboard} className="flex-1">
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </Button>
              <Button size="sm" onClick={() => onOpenChange(false)} className="flex-1">
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function TokenList() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newToken, setNewToken] = useState<CreateTokenResponse | null>(null)
  const [createdName, setCreatedName] = useState<string | undefined>()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showNewTokenDialog, setShowNewTokenDialog] = useState(false)

  const loadTokens = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await tokenApi.getAll()
      setTokens(withStoredNames(data))
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

  const handleCreate = async (name: string) => {
    setIsCreating(true)
    setError(null)
    try {
      const token = await tokenApi.create(name)
      rememberTokenName(token.token, name)
      setCreatedName(name)
      setNewToken(token)
      setShowCreateDialog(false)
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
    if (confirm("Expire this token? This cannot be undone.")) {
      try {
        await tokenApi.delete(token)
        forgetTokenName(token)
        await loadTokens()
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Failed to delete token"
        alert(message)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        Loading tokens…
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">API tokens</h2>
        <Button size="sm" onClick={() => setShowCreateDialog(true)} disabled={isCreating}>
          <Plus className="h-3.5 w-3.5" />
          Generate
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded border border-destructive/40 bg-destructive/10 px-2.5 py-2 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      {tokens.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded border border-dashed border-border px-4 py-8 text-center">
          <Key className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No tokens yet</p>
          <Button size="sm" onClick={() => setShowCreateDialog(true)} disabled={isCreating}>
            <Plus className="h-3.5 w-3.5" />
            Generate token
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded border border-border">
          {tokens.map((token) => (
            <li key={token.token} className="space-y-1.5 px-2.5 py-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {token.name?.trim() || "Unnamed token"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Created {format(new Date(token.createdAt), "PP")} · Expires{" "}
                    {format(new Date(token.expiresAt), "PP")}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(token.token)}
                  aria-label="Expire token"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
              <TokenDisplay token={token.token} />
            </li>
          ))}
        </ul>
      )}

      <CreateTokenDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreate={handleCreate}
        isCreating={isCreating}
      />

      <NewTokenDialog
        open={showNewTokenDialog}
        onOpenChange={setShowNewTokenDialog}
        token={newToken}
        name={createdName}
      />
    </div>
  )
}
