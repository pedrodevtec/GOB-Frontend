export function shouldRefreshAccessToken(
  status: number | undefined,
  errorCode: string | undefined,
  alreadyRetried: boolean
) {
  return status === 401 && errorCode === "TOKEN_EXPIRED" && !alreadyRetried;
}

