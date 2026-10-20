import type { CreateTokenResponse, Token } from "@/types/token"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.emgeebee.com"

class ApiError extends Error {
  status: number
  data?: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("authToken")

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new ApiError(
      data.message || `Request failed with status ${response.status}`,
      response.status,
      data
    )
  }

  return response.json()
}

export const tokenApi = {
  async getAll(): Promise<Token[]> {
    const result = await fetchWithAuth("/tokens")
    return result.tokens || []
  },

  async create(name?: string): Promise<CreateTokenResponse> {
    const body = name?.trim() ? { name: name.trim() } : undefined
    return fetchWithAuth("/generateToken", {
      method: "POST",
      ...(body && { body: JSON.stringify(body) }),
    })
  },

  async delete(token: string): Promise<void> {
    return fetchWithAuth("/expireToken", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
  },
}

export { ApiError }
