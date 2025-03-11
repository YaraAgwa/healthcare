const Patient = require('../models/patient.model');
const Doctor = require('../models/doctor.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verificationService = require('../services/verification.service');

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

const auth = {
    register: async (req, res) => {
        try {
            const { userType, ...userData } = req.body;
            
            // 1. التحقق من البيانات المطلوبة
            if (!userData.email || !userData.password) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Email and password are required'
                });
            }

            // 2. اختيار النموذج المناسب
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
                    token,
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

            const code = await verificationService.sendCode(phoneNumber, userType);

            return res.json({
                status: 'success',
                message: 'Verification code sent successfully',
                code  
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
            const { email, userType } = req.body;
            const newPassword = '147852';

            console.log('\n=== PASSWORD RESET PROCESS ===');
            console.log('Input:', { email, userType, newPassword });

            const Model = userType === 'doctor' ? Doctor : Patient;

            // 1. تشفير كلمة المرور
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            
            console.log('Hashing details:', {
                salt,
                hashedPassword
            });

            // 2. تحديث في قاعدة البيانات
            const updatedUser = await Model.findOneAndUpdate(
                { email },
                { password: hashedPassword },
                { new: true }
            ).select('+password');

            if (!updatedUser) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }

            
            console.log('Update verification:', {
                email: updatedUser.email,
                newStoredHash: updatedUser.password
            });
 
            const testCompare = await bcrypt.compare(newPassword, updatedUser.password);
            console.log('Test comparison:', {
                password: newPassword,
                hash: updatedUser.password,
                matches: testCompare
            });

            return res.json({
                status: 'success',
                message: 'Password reset successfully',
                verification: {
                    testCompare,
                    password: newPassword 
                }
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
    }
};

module.exports = auth; 