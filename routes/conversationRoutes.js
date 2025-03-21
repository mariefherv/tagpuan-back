const express = require("express");
const router = express.Router();
const conversationController = require("../controllers/conversationControllers");

const auth = require("../auth");

// Create a new conversation with a farmer
router.post("/create/:userId", auth.verify, conversationController.createConversation);

// Retrieve a specific conversation by ID or by userId
router.get("/:conversationId?", auth.verify, conversationController.getConversation);

// Send a message in an existing conversation
router.post("/:conversationId/message", auth.verify, conversationController.sendMessage);

// Get all conversations of the logged-in user
router.get("/", auth.verify, conversationController.getUserConversations);

module.exports = router;
