require('dotenv').config();

const Patient = require('../models/patient.model');
const Doctor = require('../models/doctor.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verificationService = require('../services/verification.service');
const twilio = require('twilio');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const express = require('express');
const router = express.Router();

let verificationCodes = {};

const resetCodes = new Map();

const getModel = type => type === 'doctor' ? Doctor : Patient;

const handleError = (res, message) => res.status(400).json({ message });

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const createToken = (user, userType) => {
    return jwt.sign(
        { id: user._id, userType },
        'test-secret-key',
        { expiresIn: '24h' }
    );
};

const findUser = async (phoneNumber, userType) => {
    const Model = userType === 'doctor' ? Doctor : Patient;
    const user = await Model.findOne({ phoneNumber });
    console.log('Find user result:', {
        found: !!user,
        phoneNumber,
        userType,
        userId: user ? user._id : null,
        hasResetCode: user ? !!user.resetCode : false
    });
    return user;
};

const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const auth = {
    register: async (req, res) => {
        try {
            const { userType, ...userData } = req.body;
            
          
            if (!userData.email || !userData.password) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Email and password are required'
                });
            }

          
            const Model = userType === 'doctor' ? Doctor : Patient;

         
            const existingUser = await Model.findOne({ email: userData.email });
            if (existingUser) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Email already exists'
                });
            }

          
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);

            
            const user = new Model({
                ...userData,
                password: hashedPassword
            });

             
            await user.save();

           
            return res.status(201).json({
                status: 'success',
                message: 'User registered successfully'
            });

        } catch (error) {
            console.error('Registration error:', error);
            return res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password, userType } = req.body;

            console.log('\n=== LOGIN ATTEMPT DETAILS ===');
            console.log('Input:', {
                email,
                password: password.toString(),
                userType
            });

            const Model = userType === 'doctor' ? Doctor : Patient;
            
            const user = await Model.findOne({ email }).select('+password');
            
            if (!user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid email or password'
                });
            }

            console.log('Stored password:', user.password);

            try {
                const cleanPassword = password.toString().trim();
                
                const isMatch = bcrypt.compareSync(cleanPassword, user.password);
                
                console.log('Comparison details:', {
                    inputPassword: cleanPassword,
                    storedHash: user.password,
                    isMatch: isMatch
                });

                if (!isMatch) {
                    return res.status(401).json({
                        status: 'error',
                        message: 'Invalid email or password'
                    });
                }

                const token = jwt.sign(
                    { 
                        userId: user._id, 
                        userType,
                        email: user.email 
                    },
                    process.env.JWT_SECRET || 'your-secret-key',
                    { expiresIn: '24h' }
                );

                return res.json({
                    status: 'success',
                    user: {
                        id: user._id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        userType
                    }
                });

            } catch (bcryptError) {
                console.error('Bcrypt error:', bcryptError);
                console.log('Error details:', {
                    message: bcryptError.message,
                    stack: bcryptError.stack
                });
                return res.status(500).json({
                    status: 'error',
                    message: 'Error verifying password'
                });
            }

        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Server error'
            });
        }
    },

    checkUser: async (req, res) => {
        try {
            const { phoneNumber, userType } = req.body;
            console.log('\n=== CHECKING USER ===');
            console.log('Request:', { phoneNumber, userType });

            const Model = userType === 'doctor' ? Doctor : Patient;
            const user = await Model.findOne({ phoneNumber }).select('+password');

            console.log('\n=== USER DETAILS ===');
            console.log('Found:', !!user);
            if (user) {
                console.log('User:', {
                    id: user._id,
                    phoneNumber: user.phoneNumber,
                    hasPassword: !!user.password,
                    password: user.password  
                });
            }

            return res.json({
                status: 'success',
                exists: !!user,
                details: user ? {
                    id: user._id,
                    phoneNumber: user.phoneNumber,
                    hasPassword: !!user.password
                } : null
            });

        } catch (error) {
            console.error('Check User Error:', error);
            return res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const { phoneNumber, userType } = req.body;

            if (!phoneNumber || !userType) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Phone number and user type are required'
                });
            }

            // إنشاء كود تحقق عشوائي (مثلاً 6 أرقام)
            const code = Math.floor(100000 + Math.random() * 900000).toString();

            // حفظ الكود في الذاكرة مع رقم الهاتف
            verificationCodes[phoneNumber] = code;

            return res.json({
                status: 'success',
                message: 'Verification code generated successfully',
                code // إرسال الكود في الـ response
            });

        } catch (error) {
            console.error('Forgot password error:', error);
            return res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    resetPassword: async (req, res) => {
        try {
            const { phoneNumber, code, newPassword, userType } = req.body;

            console.log('\n=== PASSWORD RESET PROCESS ===');
            console.log('Input:', { phoneNumber, code, userType });

           
            if (!phoneNumber || !code || !newPassword || !userType) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Phone number, verification code, new password and user type are required'
                });
            }

            // تحقق من الكود المخزن
            if (verificationCodes[phoneNumber] !== code) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid verification code'
                });
            }

            const Model = userType === 'doctor' ? Doctor : Patient;
            
            const user = await Model.findOne({ phoneNumber });
            console.log('User search result:', {
                phoneNumber,
                userFound: !!user
            });

            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            user.password = hashedPassword;
            await user.save();

            // احذف الكود بعد الاستخدام (اختياري)
            delete verificationCodes[phoneNumber];

            return res.json({
                status: 'success',
                message: 'Password reset successfully',
            });

        } catch (error) {
            console.error('Reset error:', error);
            return res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    authSuccess: (req, res) => {
        res.send(`
            <script>
                if (window.opener) {
                    window.opener.postMessage({ token: '${req.query.token}' }, '*');
                    window.close();
                }
            </script>
        `);
    },

    updateProfile: async (req, res) => {
        try {
            const { userType, userId, ...updateData } = req.body;
            const Model = userType === 'doctor' ? Doctor : Patient;

            delete updateData.email;
            delete updateData.password;

            const user = await Model.findByIdAndUpdate(
                userId,
                { $set: updateData },
                { new: true }
            );

            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }

            return res.json({
                status: 'success',
                message: 'Profile updated successfully',
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phoneNumber: user.phoneNumber,
                    userType
                }
            });
        } catch (error) {
            console.error('Update profile error:', error);
            return res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    deleteAccount: async (req, res) => {
        try {
            const { userType, userId } = req.body;
            const Model = userType === 'doctor' ? Doctor : Patient;

            const user = await Model.findByIdAndDelete(userId);

            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }

            return res.json({
                status: 'success',
                message: 'Account deleted successfully'
            });
        } catch (error) {
            console.error('Delete account error:', error);
            return res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
};

 

module.exports = auth; 