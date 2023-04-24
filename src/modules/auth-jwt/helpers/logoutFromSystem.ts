import { Response } from 'express'

export const logoutFromSystem = (res: Response) => {
  res.clearCookie('Authentication')
  res.clearCookie('Refresh')
  res.clearCookie('RtSessionId')
  res.clearCookie('UserId')
}
