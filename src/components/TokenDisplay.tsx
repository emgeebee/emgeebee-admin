import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface TokenDisplayProps {
  token: string
}

export function TokenDisplay({ token }: TokenDisplayProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const maskedToken = `${token.slice(0, 8)}...${token.slice(-8)}`

  return (
    <div className="flex items-center gap-2 rounded-md bg-muted p-3">
      <code className="flex-1 text-sm font-mono">{maskedToken}</code>
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
