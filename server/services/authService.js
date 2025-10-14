import User from '../models/User.js';
import jwt from 'jsonwebtoken';

class AuthService {
  generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { 
      expiresIn: '7d' 
    });
  }


  async register(userData) {
    const { email, password } = userData;


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }


    const user = new User({
      email,
      password,
      role: 'admin'
    });

    await user.save();


    const token = this.generateToken(user._id);

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    };
  }


  async login(credentials) {
    const { email, password } = credentials;


    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }


    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }


    const token = this.generateToken(user._id);

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    };
  }


  async getUserById(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user._id,
      email: user.email,
      role: user.role
    };
  }


  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }


  async getAllUsers(filters = {}) {
    const { page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments();

    return {
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    };
  }


  async deleteUser(userId) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return { message: 'User deleted successfully' };
  }
}

export default new AuthService();