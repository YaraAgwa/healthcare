const Message = require('../models/message.model');
const path = require('path');

// إرسال رسالة (نصية أو مع ملف)
exports.sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, senderType, receiverType, content } = req.body;
        let fileUrl = null;
        let fileType = null;
        if (req.file) {
            fileUrl = `/uploads/${req.file.filename}`;
            fileType = req.file.mimetype;
        }
        const message = new Message({
            senderId,
            receiverId,
            senderType,
            receiverType,
            content,
            fileUrl,
            fileType
        });
        await message.save();
        // إرسال إشعار للطرف المستقبل
        const notificationService = require('../services/notification.service');
        await notificationService.createNotification(receiverId, receiverType, 'لديك رسالة جديدة');
        res.json({ status: 'success', });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// جلب كل الرسائل بين طرفين
exports.getConversation = async (req, res) => {
    try {
        const { user1, user2 } = req.query;
        const messages = await Message.find({
            $or: [
                { senderId: user1, receiverId: user2 },
                { senderId: user2, receiverId: user1 }
            ]
        }).sort({ createdAt: 1 });

        // استخراج محتوى الرسالة أو اسم الملف فقط
        const contents = messages.map(msg => msg.content ? msg.content : (msg.fileUrl ? msg.fileUrl : null)).filter(Boolean);

        res.json({ status: 'success', data: contents });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}; 