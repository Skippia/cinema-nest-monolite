export type Tokens = {
  access_token: string
  refresh_token: string
}

export type TokensWithClientData = Tokens & { rt_session_id: number; user_id: number }
