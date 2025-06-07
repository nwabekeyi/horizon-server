// authController
import bcrypt from 'bcrypt';
import { User } from '../models/userModel.js';
import RegistrationPin from '../models/registrationPinModel.js';
import { sendEmail } from '../configs/emailConfig.js';
import { signJwt, verifyJwt } from '../utils/JWTconfig.js';
import { prodUrl } from '../configs/envConfig.js';

// Generate a random 4-digit PIN
const generatePin = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 1000-9999
};

// Register user (generate and send PIN)
export const registerUser = async (req, res) => {
  console.log('Register User Request Body:', req.body);
  const { email, firstName } = req.body || {};

  if (!email || !firstName) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email and firstName are required' 
    });
  }

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'Email is already in use' 
      });
    }

    // Generate 4-digit PIN
    const pin = generatePin();

    // Send verification email
    await sendEmail({
      to: email,
      subject:  'Verify Your Email',
      template: 'verification',
      data: {
        name: firstName,
        pin,
      },
    });

    // Store PIN in RegistrationPin collection
    const registrationPin = new RegistrationPin({
      email,
      pin,
    });
    await registrationPin.save();

    res.status(200).json({
      success: true,
      message: `A 4-digit PIN has been sent to ${email}. Please use it to complete your registration.`,
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: Unable to register', 
      error: error.message || error 
    });
  }
};

// Login user
export const loginUser = async (req, res) => {
  console.log('Login Request Body:', req.body);
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 2FA check
    if (user.twoFA?.enabled) {
      return res.status(200).json({
        success: true,
        message: '2FA required',
        twoFA: {
          userId: user._id,
          enabled: true
        }
      });
    }

    const { password: _, ...userWithoutPassword } = user.toObject();

    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };
    const token = signJwt(payload, '1h');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: Unable to login',
      error: error.message || error
    });
  }
};



// Generate password reset token (valid for 1 hour)
const generatePasswordResetToken = (userId) => {
  return signJwt({ userId }, '1h'); // Token expires in 1 hour
};

// Send password reset link via email
export const sendPasswordResetLink = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate the password reset token
    const token = generatePasswordResetToken(user._id);

    // Send password reset email with the link
    const resetLink = `${prodUrl}/authentication/reset-password?token=${token}`;

    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      template: 'passwordReset', // EJS template for password reset email
      data: {
        resetLink,
        firstName: user.firstName,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email',
    });
  } catch (error) {
    console.error('Error during password reset email:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: Unable to send password reset link',
      error: error.message || error,
    });
  }
};

// Reset password after validating the token
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Token and new password are required',
    });
  }

  try {
    // Verify the token and extract userId
    const decoded = verifyJwt(token);
    const userId = decoded.userId;

    // Check if user exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: Unable to reset password',
      error: error.message || error,
    });
  }
};


// Confirm Password
export const confirmPassword = async (req, res) => {
  const { userId, password } = req.body;

  if (!userId || !password) {
    return res.status(400).json({ success: false, message: 'User ID and password are required' });
  }

  try {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    return res.status(200).json({ success: true, message: 'Password confirmed successfully' });
  } catch (error) {
    console.error('Error confirming password:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};