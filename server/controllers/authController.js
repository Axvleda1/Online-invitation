import authService from '../services/authService.js';
import { validationResult } from 'express-validator';

class AuthController {  
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const { email, password } = req.body;

      const result = await authService.register({ email, password });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      console.error('Register controller error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const { email, password } = req.body;

      const result = await authService.login({ email, password });

      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      console.error('Login controller error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getCurrentUser(req, res) {
    try {
      const user = await authService.getUserById(req.user._id);

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAllUsers(req, res) {
    try {
      const { page, limit } = req.query;
      
      const result = await authService.getAllUsers({ page, limit });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      if (id === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'You cannot delete your own account'
        });
      }

      const result = await authService.deleteUser(id);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async logout(req, res) {
    try {
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new AuthController();