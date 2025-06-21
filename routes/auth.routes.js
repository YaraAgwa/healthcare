const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Local authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// بدء تسجيل الدخول بجوجل
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] })); 
 
// كول باك بعد نجاح جوجل 
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {    
    // هنا يمكنكِ إنشاء JWT بنفسك
    const token = jwt.sign({ id: req.user._id, email: req.user.email }, 'your-secret', { expiresIn: '24h' });
    res.json({  
      status: 'success',
      token,
      user: req.user
    });
  }
);

module.exports = router; 