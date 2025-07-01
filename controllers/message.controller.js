const Message = require('../models/message.model');
 
const mongoose = require('mongoose');

// Send a message  
exports.sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, senderType, receiverType, content } = req.body;
        
        const message = new Message({
            senderId,
            receiverId,
            senderType,
            receiverType,
            content,
            
        });
        console.log('Saving message:', { senderId, receiverId });
        await message.save();
        
        // Send notification to the receiver
        const notificationService = require('../services/notification.service');
        await notificationService.createNotification(receiverId, receiverType, 'You have a new message');
        res.json({ status: 'success' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Get all messages between two parties
exports.getConversation = async (req, res) => {
    try {
        const { user1, user2 } = req.query;
       
        let user1Id, user2Id;
        try {
            user1Id = new mongoose.Types.ObjectId(user1);
            user2Id = new mongoose.Types.ObjectId(user2);
        } catch (e) {
            return res.status(400).json({ status: 'error', message: 'Invalid user id(s) provided.' });
        }
        const messages = await Message.find({
            $or: [
                { senderId: user1Id, receiverId: user2Id },
                { senderId: user2Id, receiverId: user1Id }
            ]
        }).sort({ createdAt: 1 });

         
        const conversationId = [user1, user2].sort().join('_');
        const messagesArr = messages.map(msg => ({
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            senderType: msg.senderType,
            receiverType: msg.receiverType,
            content: msg.content,
            timestamp: msg.createdAt
        }));
        res.json({
            status: 'success',
            data: {
                conversationId,
                messages: messagesArr
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}; 