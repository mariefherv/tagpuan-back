/*
    Model for conversations
*/
const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    messages: [
        {
            sender_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            content: {
                type: String,
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            },
            isRead: {
                type: Boolean,
                default: false
            }
        }
    ],
    hasUnread: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

conversationSchema.index({ participants: 1 });
conversationSchema.index({ "messages.timestamp": -1 });

module.exports = mongoose.model("Conversation", conversationSchema);
