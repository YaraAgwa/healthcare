const Doctor = require('../models/doctor.model');
const Patient = require('../models/patient.model');
const twilio = require('twilio');

const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);
const VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

class VerificationService {
    async sendCode(phoneNumber, userType) {
        try {
            console.log('\n=== SENDING CODE VIA TWILIO VERIFY ===');
            console.log('For:', { phoneNumber, userType });

            // تأكد أن المستخدم موجود
            const Model = userType === 'doctor' ? Doctor : Patient;
            const user = await Model.findOne({ phoneNumber });
            if (!user) {
                throw new Error('User not found');
            }

            // إرسال الكود عبر Twilio Verify
            await twilioClient.verify.v2.services(VERIFY_SERVICE_SID)
                .verifications
                .create({ to: phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`, channel: 'sms' });

            return true;
        } catch (error) {
            console.error('Error sending code via Twilio Verify:', error);
            throw error;
        }
    }

    async verifyCode(phoneNumber, code) {
        try {
            console.log('\n=== VERIFYING CODE VIA TWILIO VERIFY ===');
            console.log('Input:', { phoneNumber, code });

            const verificationCheck = await twilioClient.verify.v2.services(VERIFY_SERVICE_SID)
                .verificationChecks
                .create({ to: phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`, code });

            if (verificationCheck.status === 'approved') {
                return {
                    isValid: true,
                    message: 'Code verified successfully'
                };
            } else {
                return {
                    isValid: false,
                    message: 'Invalid or expired verification code'
                };
            }
        } catch (error) {
            console.error('Error verifying code via Twilio Verify:', error);
            return {
                isValid: false,
                message: 'Verification failed'
            };
        }
    }
}

module.exports = new VerificationService();