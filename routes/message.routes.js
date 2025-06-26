const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const multer = require('multer');
const path = require('path');

// إعداد التخزين للملفات
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// إرسال رسالة (نصية أو مع ملف)
router.post('/send', upload.single('file'), messageController.sendMessage);
// جلب المحادثة بين طرفين
router.get('/conversation', messageController.getConversation);

module.exports = router; 