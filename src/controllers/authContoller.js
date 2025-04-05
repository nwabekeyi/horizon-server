const bcrypt = require('bcrypt');
const {User} = require('../models/userModel');
const RegistrationPin = require('../models/registrationPinModel');
const { sendEmail } = require('../configs/emailConfig');
const { signJwt } = require('../utils/JWTconfig');

// Generate a random 4-digit PIN
const generatePin = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 1000-9999
};

// Register user (generate and send PIN)
const registerUser = async (req, res) => {
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
      subject: 'Horizon - Verify Your Email',
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
const loginUser = async (req, res) => {
  console.log('Login Request Body:', req.body);
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email and password are required' 
    });
  }

  try {
    const user = await User.findOne({ email });
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
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
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

module.exports = { registerUser, loginUser };