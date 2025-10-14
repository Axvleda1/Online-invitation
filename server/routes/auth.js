import express from 'express';
import { body } from 'express-validator';
import authController from '../controllers/authController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/register',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  authController.register
);


router.post('/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').exists().withMessage('Password is required')
  ],
  authController.login
);


router.get('/me', authenticate, authController.getCurrentUser);


router.get('/users', authenticate, isAdmin, authController.getAllUsers);

  
router.delete('/users/:id', authenticate, isAdmin, authController.deleteUser);


router.post('/logout', authenticate, authController.logout);

export default router;