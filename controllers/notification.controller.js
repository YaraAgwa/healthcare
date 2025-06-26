const Notification = require('../models/notification.model');

// Get notifications for a user
exports.getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .select('message -_id');
        res.json({ status: 'success', data: notifications });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

 