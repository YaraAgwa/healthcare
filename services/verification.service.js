const Doctor = require('../models/doctor.model');
const Patient = require('../models/patient.model');
 

class VerificationService {
    async sendCode(phoneNumber, userType) {
        try {
            console.log('\n=== GENERATING CODE ===');
            console.log('For:', { phoneNumber, userType });

         
            const Model = userType === 'doctor' ? Doctor : Patient;
            const user = await Model.findOne({ phoneNumber });

            if (!user) {
                console.log('No user found');
                throw new Error('User not found');
            }

         
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            
           
            await Model.findByIdAndUpdate(user._id, {
                verificationCode: code,
                verificationCodeExpires: new Date(Date.now() + 5 * 60 * 1000)
            });

            console.log('\n**************************');
            console.log('* NEW CODE GENERATED');
            console.log('* Code:', code);
            console.log('* Phone:', phoneNumber);
            console.log('* Type:', userType);
            console.log('**************************\n');

            return code;
        } catch (error) {
            console.error('Error generating code:', error);
            throw error;
        }
    }

    async verifyCode(phoneNumber, code) {
        try {
            console.log('\n=== VERIFYING CODE ===');
            console.log('Input:', { phoneNumber, code });

         
            let user = await Doctor.findOne({ phoneNumber });
            if (!user) {
                user = await Patient.findOne({ phoneNumber });
            }

            console.log('User found:', !!user);
            if (user) {
                console.log('Stored code:', user.verificationCode);
                console.log('Received code:', code);
                console.log('Match:', user.verificationCode === code);
            }

            if (!user || user.verificationCode !== code) {
                return {
                    isValid: false,
                    message: 'Invalid verification code'
                };
            }

            if (user.verificationCodeExpires < Date.now()) {
                return {
                    isValid: false,
                    message: 'Code has expired'
                };
            }

            return {
                isValid: true,
                message: 'Code verified successfully',
                userType: user.constructor.modelName.toLowerCase()
            };
        } catch (error) {
            console.error('Error verifying code:', error);
            throw error;
        }
    }
}

module.exports = new VerificationService(); 