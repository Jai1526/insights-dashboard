import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validator.js';
import {
  register,
  login,
  verifyEmail,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from '../controllers/authController.js';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/verify-email/:token', verifyEmail);

router.get('/me', authenticate, getProfile);
router.get('/profile', authenticate, getProfile);
router.patch('/profile', authenticate, updateProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/change-password', authenticate, changePassword);
router.put('/password', authenticate, changePassword);
router.delete('/account', authenticate, deleteAccount);

export default router;