import AppError from '../AppError.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError ? err.message : 'Internal server error';

  if (!(err instanceof AppError)) {
    console.error(err);
  }

  res.status(statusCode).json({ error: message });
};

export default errorHandler;
