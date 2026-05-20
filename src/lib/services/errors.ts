export class AppError extends Error {
  constructor(
    public readonly userMessage: string,
    public readonly code = "APP_ERROR",
    message = userMessage
  ) {
    super(message)
    this.name = "AppError"
  }
}

export function toUserMessage(error: unknown, fallback: string) {
  if (error instanceof AppError) return error.userMessage
  if (error instanceof Error && error.message) return error.message
  return fallback
}

export function throwAppError(message: string, code = "APP_ERROR"): never {
  throw new AppError(message, code)
}
