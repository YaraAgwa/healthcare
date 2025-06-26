const Notification = require('../models/notification.model');

exports.createNotification = async (userId, userType, message) => {
    const notification = new Notification({ userId, userType, message });
    await notification.save();
}; 