const User = require('../models/user');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
require("dotenv").config();

// setup transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,   // sender email
    pass: process.env.EMAIL_PASS      // replace with Gmail App Password
  }
});

// OTP generator
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// ---------------- REGISTER ----------------
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.render("signup", { error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = Date.now() + 5 * 60 * 1000;

    user = new User({ name, email, password: hashedPassword, otp, otpExpiry });
    await user.save();

    await transporter.sendMail({
      from: 'pk2239@srmist.edu.in',
      to: email,
      subject: 'Verify your email',
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`
    });

   
    res.render("verify", { email, msg: "User registered. Please verify your email." });

  } catch (err) {
    console.error(err);
    res.status(500).render("signup", { error: "Server error, please try again" });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });
    if (user.isVerified) return res.status(400).json({ msg: "User already verified" });

    if (user.otp !== otp) return res.status(400).json({ msg: "Invalid OTP" });
    if (Date.now() > user.otpExpiry) return res.status(400).json({ msg: "OTP expired" });

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

   res.render("login", { msg: "Email verified. Please log in." });
  } catch (err) {
    res.status(500).json({ msg: "Error verifying OTP", error: err.message });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from: 'pk2239@srmist.edu.in',
      to: email,
      subject: 'Resend OTP',
      text: `Your new OTP is ${otp}. It is valid for 5 minutes.`
    });

    res.status(200).json({ message: 'OTP resent successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error resending OTP', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

   
    const user = await User.findOne({ email });


    if (!user) {
      return res.render("login", { error: "User not found" });
    }

 
    if (!user.isVerified) {
      return res.render("verify", { error: "Please verify your email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("login", { error: "Invalid credentials" });
    }


    req.session.user = user;

   
    res.render("home", { user });

  } catch (err) {
    console.error(err);
    res.status(500).render("login", { error: "Server error, please try again" });
  }
};



exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).send("Error logging out");
    }
    res.clearCookie('connect.sid'); 
    res.redirect("/login"); 
  });
};



exports.dashboard = async (req, res) => {
  res.json({ message: `Welcome to the dashboard, ${req.user.name}` });
};


exports.getProfile = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.redirect("/login");

    res.render("profile", { user, msg: null, error: null });
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.session.user._id);

    if (!user) return res.render("profile", { error: "User not found", user, msg: null });

    user.name = name || user.name;
    user.email = email || user.email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();


    req.session.user = user;

   
    res.render("home", { user, msg: "Profile updated successfully!" });

  } catch (err) {
    res.render("profile", { error: "Server error, please try again", user: req.session.user, msg: null });
  }
};

