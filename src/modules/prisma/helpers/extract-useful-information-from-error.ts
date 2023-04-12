export function extractUsefulInformationFromError(messageError: string) {
  const regex = /.*(?= invocation)/
  const message = messageError.match(regex)

  if (Array.isArray(message)) {
    return message[0]
  }

  return messageError
}
