const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
    recipient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", required: true 
    },
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    type: { 
        type: String, 
        enum: ["new_convo", "message", "bid_won", "order_status", "new_order", "item_bought", "others"], required: true 
    },
    referenceId: { 
        type: mongoose.Schema.Types.ObjectId 
    }, // Refers to the related entity (message, bid, order, etc.)
    content: { 
        type: String, required: true 
    },
    isRead: { 
        type: Boolean, default: false 
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", NotificationSchema);
