const Conversation = require("../models/Conversation");
const User = require("../models/User");

module.exports.createConversation = async (req, res) => {
    try {
        const recipient = await User.findById(req.params.userId);
        if (!recipient) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        // Check if a conversation already exists
        const existingConversation = await Conversation.findOne({
            participants: { $all: [req.user.id, recipient._id] }
        });

        if (existingConversation) {
            return res.status(200).json(existingConversation);
        }

        // Create new conversation
        const conversation = new Conversation({
            participants: [req.user.id, recipient._id],
            messages: []
        });

        await conversation.save();
        res.status(201).json(conversation);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



// Retrieve a specific conversation by ID
module.exports.getConversation = async (req, res) => {
    try {
        let conversation;

        if (req.params.conversationId) {
            // Retrieve by conversation ID
            conversation = await Conversation.findById(req.params.conversationId);
        } else if (req.query.userId) {
            // Retrieve by two participants (current user + another user)
            conversation = await Conversation.findOne({
                participants: { $all: [req.user.id, req.query.userId] }
            });
        }

        if (!conversation) return res.status(404).json({ error: "Conversation not found" });

        res.json(conversation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Send a message in an existing conversation
module.exports.sendMessage = async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.conversationId);
        if (!conversation) return res.status(404).json({ error: "Conversation not found" });

        const message = {
            sender_id: req.body.sender_id,
            content: req.body.content,
            timestamp: new Date()
        };

        conversation.messages.push(message);
        await conversation.save();
        res.status(201).json(message);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// View all conversations of a user
module.exports.getUserConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({ participants: req.user.id });
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
