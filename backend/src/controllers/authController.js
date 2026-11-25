import User from '../models/User.js';
import { generateToken, sendTokenCookie, clearTokenCookie } from '../utils/token.js';
import { isDBConnected } from '../config/db.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const register = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database service is currently unavailable. Please verify MongoDB connection in backend configuration.'
      });
    }

    const { fullName, email, password, confirmPassword } = req.body;

    // Field validation
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required.'
      });
    }

    if (fullName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be at least 2 characters.'
      });
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Password is required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.'
      });
    }

    // Create user (password is automatically hashed via Mongoose pre-save hook)
    const newUser = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password
    });

    const safeUser = newUser.toSafeJSON();
    const token = generateToken({ userId: safeUser.id, email: safeUser.email });

    sendTokenCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to SpendWise AI.',
      user: safeUser,
      token // Provided for flexibility if client wants to use header auth
    });
  } catch (error) {
    console.error('Registration controller error:', error.message);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to complete registration due to an unexpected server error.'
    });
  }
};

export const login = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database service is currently unavailable. Please verify MongoDB connection in backend configuration.'
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Both email and password are required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    // Fetch user and explicitly select password hash
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const safeUser = user.toSafeJSON();
    const token = generateToken({ userId: safeUser.id, email: safeUser.email });

    sendTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: safeUser,
      token
    });
  } catch (error) {
    console.error('Login controller error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to process login request due to a server error.'
    });
  }
};

export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user
  });
};

export const logout = async (req, res) => {
  clearTokenCookie(res);
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};
