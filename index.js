const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Replace with your MongoDB connection string and email configuration
const mongoURI = 'mongodb://localhost:27017/your-database-name';
const emailConfig = {
  // Set up your email service provider details (host, port, user, password)
};

// Define the User model schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String }, // For OTP validation
  location: { type: String },
  age: { type: Number },
  workDetails: { type: String },
  verified: { type: Boolean, default: false }
});

const User = mongoose.model('User', UserSchema);

const app = express();
app.use(cors()); // Enable CORS for API access
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Function to generate a random OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to send OTP via email
async function sendOTP(email, otp) {
  // Use your email service provider's API or library to send the email
  // with the generated OTP

  const transporter = nodemailer.createTransport(emailConfig);
  const mailOptions = {
    from: 'your-email@example.com',
    to: email,
    subject: 'Account Verification OTP',
    text: Your OTP for account verification is: ${otp}
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.error(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

// Register API
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  // Check for existing user
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).send('Email already exists');
  } catch (err) {
    return res.status(500).send('Server error');
  }

  // Hash password securely
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Generate OTP
  const otp = generateOTP();

  const newUser = new User({
    email,
    password: hashedPassword,
    otp
  });

  try {
    await newUser.save();
    await sendOTP(email, otp);
    res.status(201).send('
