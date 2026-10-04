import AppError from '../AppError.js';

export const validate = (fn) => (req, res, next) => {
  const errors = fn(req);

  if (Array.isArray(errors) && errors.length > 0) {
    return next(new AppError(400, errors.join('; ')));
  }

  return next();
};

export default validate;
