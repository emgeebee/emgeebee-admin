import React, { useState } from "react"
import { Button } from "@/components/ui/Button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import type { Token } from "@/types/token"

interface TokenDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  token?: Token
  onSave: (data: any) => Promise<void>
}

export function TokenDialog({ open, onOpenChange, token, onSave }: TokenDialogProps) {
  const [name, setName] = useState(token?.name || "")
  const [description, setDescription] = useState(token?.description || "")
  const [expiresAt, setExpiresAt] = useState(token?.expiresAt || "")
  const [scopes, setScopes] = useState(token?.scopes?.join(", ") || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setName(token?.name || "")
      setDescription(token?.description || "")
      setExpiresAt(token?.expiresAt || "")
      setScopes(token?.scopes?.join(", ") || "")
      setError(null)
    }
  }, [open, token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const data = {
        name,
        description: description || undefined,
        expiresAt: expiresAt || undefined,
        scopes: scopes ? scopes.split(",").map((s: string) => s.trim()).filter(Boolean) : undefined,
      }

      await onSave(data)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save token")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>{token ? "Edit Token" : "Create New Token"}</DialogTitle>
          <DialogDescription>
            {token
              ? "Update the token information below."
              : "Create a new long-lived token for API access."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name *
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              placeholder="My API Token"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Token used for..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="expiresAt" className="text-sm font-medium">
              Expires At
            </label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={expiresAt}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpiresAt(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="scopes" className="text-sm font-medium">
              Scopes
            </label>
            <Input
              id="scopes"
              value={scopes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setScopes(e.target.value)}
              placeholder="read, write, admin"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of scopes
            </p>
          </div>
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : token ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
