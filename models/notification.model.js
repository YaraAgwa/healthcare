const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'userType'
    },
    userType: {
        type: String,
        enum: ['Doctor', 'Patient'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema); 