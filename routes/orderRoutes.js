const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderControllers");

const auth = require("../auth");

const { verify } = auth;

// Create an order
router.post("/create", verify, orderController.createOrder);

// View a specific order by ID
router.get("/:id", verify, orderController.viewOrder);

// Request an order (directly assigning a farmer)
router.post("/request/:farmer_id", verify, orderController.requestOrder);

// View all orders (with optional query filters)
router.get("/", verify, orderController.viewAllOrders);

module.exports = router;
