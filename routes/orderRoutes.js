const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderControllers");

const auth = require("../auth");

const { verify } = auth;

// Create an order
router.post("/create", verify, orderController.createOrder);

// View all orders (with optional query filters)
router.get("/viewAll", verify, orderController.viewAllOrders);

// Request an order (directly assigning a farmer)
router.post("/request/:farmer_id", verify, orderController.requestOrder);

// View orders by user
router.get("/view", verify, orderController.viewUserOrders);

// Update order status
router.put("/update/:orderId", verify, orderController.updateOrderStatus);

// Cancel order status
router.put("/cancel/:orderId", verify, orderController.cancelOrder);

// Confirm order delivery
router.put("/confirm/:orderId", verify, orderController.confirmOrder);

// View a specific order by ID
router.get("/:id", verify, orderController.viewOrder);


module.exports = router;
