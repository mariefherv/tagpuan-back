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
                ref: "User"
            },
            content: String,
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model("Conversation", conversationSchema);
