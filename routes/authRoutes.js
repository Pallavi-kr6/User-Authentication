const express = require('express');
const { register,verifyOTP,resendOTP,login,logout,dashboard ,  getProfile, updateProfile } = require('../controllers/authController');
const authMiddleware = require('../middleware/authmiddleware');
const router = express.Router();
router.get('/login', (req, res) => {
    res.render('login');  
});
router.get('/', (req, res) => {
    res.render('login');  
});
router.get('/signup', (req, res) => {
    res.render('signup');
});

router.get('/verify', (req, res) => {
    res.render('verify');
});

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.get('/dashboard', authMiddleware, dashboard);
router.get("/profile", authMiddleware, getProfile);
router.post("/profile", authMiddleware, updateProfile); 
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;