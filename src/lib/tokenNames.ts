const STORAGE_KEY = "tokenNames"

export function getStoredTokenNames(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== "object") return {}
    return parsed as Record<string, string>
  } catch {
    return {}
  }
}

export function rememberTokenName(token: string, name: string) {
  const names = getStoredTokenNames()
  names[token] = name
  localStorage.setItem(STORAGE_KEY, JSON.stringify(names))
}

export function forgetTokenName(token: string) {
  const names = getStoredTokenNames()
  if (!(token in names)) return
  delete names[token]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(names))
}

export function withStoredNames<T extends { token: string; name?: string }>(
  tokens: T[]
): T[] {
  const stored = getStoredTokenNames()
  return tokens.map((item) => {
    const name = item.name?.trim() || stored[item.token]
    return name ? { ...item, name } : item
  })
}
