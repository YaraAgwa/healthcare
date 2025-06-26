const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    senderType: {
        type: String,
        enum: ['Doctor', 'Patient'],
        required: true
    },
    receiverType: {
        type: String,
        enum: ['Doctor', 'Patient'],
        required: true
    },
    content: {
        type: String
    },
    fileUrl: {
        type: String
    },
    fileType: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema); 