export interface Token {
  token: string
  userid: string
  createdAt: string
  expiresAt: string
  /** Optional human-readable label from the API */
  name?: string
}

export interface CreateTokenResponse {
  token: string
  sub: string
  expiresIn: string
  expiresAt: string
  name?: string
}
