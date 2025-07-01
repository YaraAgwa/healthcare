const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

 
router.get('/:userId', notificationController.getNotifications);
router.delete('/:id', notificationController.deleteNotification); 

 

module.exports = router; 