const express = require("express");
const router = express.Router();
const bidController = require("../controllers/bidControllers");

// Create a new bid
router.post("/", bidController.createBid);

// View all bids for a specific order
router.get("/order/:orderId", bidController.viewAllBids);

// View a specific bid by ID
router.get("/:id", bidController.viewBid);

module.exports = router;
