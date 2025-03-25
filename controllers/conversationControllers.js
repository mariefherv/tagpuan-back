const Conversation = require("../models/Conversation");
const User = require("../models/User");
const Notification = require("../models/Notification");

module.exports.createConversation = async (req, res) => {
    try {
        const recipient = await User.findById(req.params.userId).select("first_name last_name");
        if (!recipient) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        // Check if a conversation already exists
        const existingConversation = await Conversation.findOne({
            participants: { $all: [req.user.id, recipient._id] }
        }).populate("participants", "first_name last_name profile_picture isOnline");

        if (existingConversation) {
            return res.status(200).json(existingConversation);
        }

        // Create new conversation
        const conversation = new Conversation({
            participants: [req.user.id, recipient._id],
            messages: []
        });

        await conversation.save();
        
        const sender = await User.findById(req.user.id);

        if(sender) {
            const full_name = sender.first_name + sender.last_name;

            // Create Notification
            await Notification.create({
                recipient: recipient._id,
                sender: sender._id,
                type: "new_convo",
                referenceId: conversation._id,
                content: `${full_name} wants to send you a message.`
            });
        }
        
                
        res.status(201).json(await conversation.populate("participants", "first_name last_name profile_picture isOnline"));
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports.getConversation = async (req, res) => {
    try {
        let conversation;

        if (req.params.conversationId) {
            // Retrieve by conversation ID
            conversation = await Conversation.findById(req.params.conversationId)
                .populate({
                    path: "participants",
                    select: "first_name last_name profile_picture isOnline",
                })
                .populate({
                    path: "messages.sender_id",
                    select: "first_name last_name profile_picture isOnline",
                });
        } else if (req.query.userId) {
            // Retrieve by two participants (current user + another user)
            conversation = await Conversation.findOne({
                participants: { $all: [req.user.id, req.query.userId] }
            })
                .populate({
                    path: "participants",
                    select: "first_name last_name profile_picture isOnline",
                })
                .populate({
                    path: "messages.sender_id",
                    select: "first_name last_name profile_picture isOnline",
                });
        }

        if (!conversation) return res.status(404).json({ error: "Conversation not found" });

        // Filter out the requesting user from participants
        conversation = conversation.toObject(); // Convert to plain object
        conversation.participants = conversation.participants.filter(
            participant => participant._id.toString() !== req.user.id
        );

        res.json(conversation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mark messages as read in a conversation
module.exports.markMessagesAsRead = async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.conversationId);
        
        if (!conversation) return res.status(404).json({ error: "Conversation not found" });

        let isUpdated = false;

        conversation.messages.forEach(message => {
            if (message.sender_id.toString() !== req.user.id && !message.isRead) {
                message.isRead = true;
                isUpdated = true;
            }
        });

        if (isUpdated) {
            const hasUnreadMessages = conversation.messages.some(msg => !msg.isRead);
            conversation.hasUnread = hasUnreadMessages;

            await conversation.save();

            // Remove unread message notifications for this conversation
            await Notification.deleteMany({
                recipient: req.user.id,
                type: "message",
                referenceId: conversation._id
            });
        }

        res.json({ message: "Messages marked as read" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Send a message in an existing conversation
module.exports.sendMessage = async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.conversationId)
            .populate("participants", "first_name last_name profile_picture isOnline");

        if (!conversation) return res.status(404).json({ error: "Conversation not found" });

        const message = {
            sender_id: req.user.id,
            content: req.body.content,
            timestamp: new Date()
        };

        conversation.messages.push(message);
        conversation.hasUnread = true;
        await conversation.save();

        // Notify the recipient
        const recipientId = conversation.participants.find(p => p._id.toString() !== req.user.id);
        
        if (recipientId) {
            await Notification.create({
                recipient: recipientId,
                sender: req.user.id,
                type: "message",
                referenceId: conversation._id,
                content: "You have a new message."
            });
        }

        res.status(201).json({
            message,
            participants: conversation.participants
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// View all conversations of a user
module.exports.getUserConversations = async (req, res) => {
    try {
        let conversations = await Conversation.find({ participants: req.user.id })
            .populate({
                path: "participants",
                select: "first_name last_name profile_picture isOnline",
            })
            .populate({
                path: "messages.sender_id",
                select: "first_name last_name profile_picture isOnline",
            });

        // Filter out the requesting user from each conversation's participants
        conversations = conversations.map(conversation => {
            const convoObj = conversation.toObject();
            convoObj.participants = convoObj.participants.filter(
                participant => participant._id.toString() !== req.user.id
            );
            return convoObj;
        });

        res.json(conversations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

