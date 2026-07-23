import rateLimit from 'express-rate-limit';

// Strict limit for auth endpoints to prevent brute-force attacks
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many authentication attempts, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Generous limit for analytics read endpoints
export const analyticsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Moderate limit for write operations
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Too many write requests, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});