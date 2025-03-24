const express = require("express");
const router = express.Router();
const auth = require("../auth");
const notificationControllers = require("../controllers/notificationControllers");

// Get notifications for the logged-in user
router.get("/", auth.verify, notificationControllers.getNotifications);

// Mark notification as read
router.put("/markRead/:notificationId", auth.verify, notificationControllers.markAsRead);

module.exports = router;
