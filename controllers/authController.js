import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { JWT_SECRET, JWT_EXPIRES_IN, JWT_ISSUER } from '../config/jwt.js';
import AppError from '../utils/appError.js';

function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN, issuer: JWT_ISSUER }
  );
}

function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new AppError('Name, email, and password are required.', 400));
    }
    if (password.length < 8) {
      return next(new AppError('Password must be at least 8 characters.', 400));
    }

    // The User schema has `lowercase: true` on email, so toLowerCase is redundant but kept for clarity
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(new AppError('An account with this email already exists.', 409));
    }

    const verificationToken = generateVerificationToken();
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      verificationToken,
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const token = signToken(user);

    res.status(201).json({
      message: 'Account created successfully. Please verify your email.',
      token,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError('An account with this email already exists.', 409));
    }
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Email and password are required.', 400));
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password.', 401));
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user);

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const { token } = req.params;

    if (!token) {
      return next(new AppError('Verification token is required.', 400));
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return next(new AppError('Invalid or expired verification token.', 400));
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ message: 'Email verified successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req, res, next) {
  try {
    res.status(200).json({ user: req.user.toPublicJSON() });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const allowedFields = ['name', 'avatar', 'company', 'jobTitle'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return next(new AppError('No valid fields to update.', 400));
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: 'Profile updated successfully.',
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new AppError('Current password and new password are required.', 400));
    }
    if (newPassword.length < 8) {
      return next(new AppError('New password must be at least 8 characters.', 400));
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return next(new AppError('Current password is incorrect.', 401));
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function deleteAccount(req, res, next) {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.status(200).json({ message: 'Account deleted successfully.' });
  } catch (error) {
    next(error);
  }
}