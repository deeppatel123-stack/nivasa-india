export class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const badRequest = (message, details) => new AppError(400, message, details);
export const unauthorized = (message = 'Authentication is required.') => new AppError(401, message);
export const forbidden = (message = 'You do not have access to this resource.') => new AppError(403, message);
export const conflict = (message, details) => new AppError(409, message, details);
export const notFound = (message = 'Resource not found') => new AppError(404, message);
export const unavailable = (message, details) => new AppError(503, message, details);
