import AppError from '../utils/appError.js';

export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return next(new AppError('Please provide a valid name (at least 2 characters).', 400));
  }

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return next(new AppError('Please provide a valid email address.', 400));
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    return next(new AppError('Password must be at least 8 characters long.', 400));
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Email and password are required.', 400));
  }

  next();
};
