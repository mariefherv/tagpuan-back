const Notification = require("../models/Notification");

// Retrieve notifications
module.exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ 
            recipient: req.user.id, 
            type: { $ne: "message" } // Exclude notifications with type "message"
        }).sort({ createdAt: -1 });

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mark notifications as read
module.exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const notification = await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });

        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }

        res.json({ message: "Notification marked as read", notification });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
