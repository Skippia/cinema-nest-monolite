import { EXPIRES_IN_RT_DAYS } from '../auth.constants'

export const getExpiresInRtOffset = () => EXPIRES_IN_RT_DAYS * 1000 * 60 /* * 60 * 24 */
