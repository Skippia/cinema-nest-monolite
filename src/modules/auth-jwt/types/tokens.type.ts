export type Tokens = {
  access_token: string
  refresh_token: string
}

export type TokensWithRtSessionId = Tokens & { rt_session_id: number }
