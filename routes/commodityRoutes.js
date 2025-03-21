const express = require("express");
const router = express.Router();
const commodityControllers = require("../controllers/commodityControllers");
const auth = require("../auth");

// Create a new conversation with a farmer
router.post("/add", auth.verify, auth.verifyAdmin, commodityControllers.addCommodity);

// Get all routes
router.get("/getAll", auth.verify, commodityControllers.getAllCommodities);

module.exports = router;
