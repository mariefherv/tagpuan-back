const express = require("express");
const router = express.Router();

const itemController = require("../controllers/itemControllers");

const auth = require("../auth");

const { verify } = auth;

// Create an order
router.post("/create", verify, itemController.createItem);

// View all items (by market)
router.get("/getItems/:market", verify, itemController.getItemsByMarket);

// View all orders of user
router.get("/viewOrders", verify, itemController.getUserOrders);

// Buy Item
router.post("/buy/:itemId", verify, itemController.buyItem);

// Cancel order status
router.put("/cancel/:orderId", verify, itemController.cancelItemOrder);

// Confirm order delivery
router.put("/confirm/:orderId", verify, itemController.confirmItemOrder);

// Delete order
router.delete("/delete/:itemId", verify, itemController.deleteItem);

// Update item order
router.put("/update/:orderId", verify, itemController.updateItemOrderStatus);

module.exports = router;
