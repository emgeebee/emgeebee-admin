export interface Token {
  id: string
  name: string
  description?: string
  token: string
  createdAt: string
  expiresAt?: string
  lastUsed?: string
  scopes?: string[]
}

export interface CreateTokenRequest {
  name: string
  description?: string
  expiresAt?: string
  scopes?: string[]
}

export interface UpdateTokenRequest {
  name?: string
  description?: string
  expiresAt?: string
  scopes?: string[]
}
