import type { Token, CreateTokenRequest, UpdateTokenRequest } from "@/types/token"

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
    return fetchWithAuth("/tokens")
  },

  async getById(id: string): Promise<Token> {
    return fetchWithAuth(`/tokens/${id}`)
  },

  async create(data: CreateTokenRequest): Promise<Token> {
    return fetchWithAuth("/tokens", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: UpdateTokenRequest): Promise<Token> {
    return fetchWithAuth(`/tokens/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },

  async delete(id: string): Promise<void> {
    return fetchWithAuth(`/tokens/${id}`, {
      method: "DELETE",
    })
  },

  async revoke(id: string): Promise<void> {
    return fetchWithAuth(`/tokens/${id}/revoke`, {
      method: "POST",
    })
  },
}

export { ApiError }
