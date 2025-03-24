const express = require("express");
const router = express.Router();
const bidController = require("../controllers/bidControllers");
const auth = require("../auth");

// Create a new bid
router.post("/create/:orderId", auth.verify, bidController.createBid);

// View all bids for a specific order
router.get("/order/:orderId", auth.verify, bidController.viewAllBids);

// View a specific bid by ID
router.get("/:id", auth.verify, bidController.viewBid);

module.exports = router;
