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
        console.log('Saved message:', message);
        // Send notification to the receiver
        const notificationService = require('../services/notification.service');
        await notificationService.createNotification(receiverId, receiverType, 'You have a new message');
        const { _id, createdAt, updatedAt, __v, ...filteredData } = message.toObject();
        res.json({ status: 'success', data: filteredData });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Get all messages between two parties
exports.getConversation = async (req, res) => {
    try {
        const { user1, user2 } = req.query;
        console.log('Querying conversation:', { user1, user2 });
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

        // Extract message content only
        const contents = messages.map(msg => msg.content).filter(Boolean);

        // Keep debug log if needed
        // const allMessages = await Message.find({});
        // console.log('All messages:', allMessages);

        res.json({ status: 'success', data: contents });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}; 