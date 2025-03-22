const Order = require("../models/Order");
const User = require("../models/User");

module.exports.createOrder = async (req, res) => {

    if (isNaN(new Date(req.body.schedule).getTime())) {
        return res.status(400).json({ error: "Invalid schedule format" });
    }

    try {
        const newOrder = new Order({
            ...req.body,
            contractor_id: req.user.id,
            schedule: new Date(req.body.schedule)
        });
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports.viewOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("contractor_id", "first_name last_name")
            .populate("commodity", "en_name hil_name")
            .lean(); // Convert to plain object for performance

        if (!order) return res.status(404).json({ error: "Order not found" });

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.requestOrder = async (req, res) => {
    try {
        const newOrder = new Order({
            ...req.body,
            contractor_id: req.user.id,
            winning_bid: {
                farmer_id: req.params.farmer_id, // Set farmer_id from URL parameter
                date_applied: new Date() // Capture request time
            }
        });

        await newOrder.save();

        res.status(201).json({
            message: "Order sent!",
            order: newOrder
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


module.exports.viewAllOrders = async (req, res) => {
    try {
        const { commodity, order_type, schedule } = req.query; // Use correct field names

        const filterConditions = {};
        
        if (commodity) {
            filterConditions.commodity = commodity;  // Ensure it's correctly mapped
        }

        if (order_type) {
            filterConditions.order_type = order_type; // Ensure field matches schema
        }

        if (schedule) {
            const startOfDay = new Date(schedule);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(schedule);
            endOfDay.setHours(23, 59, 59, 999);
            filterConditions.schedule = { $gte: startOfDay, $lte: endOfDay };
        }

        // Ensure `commodity` is populated correctly
        const orders = await Order.find(filterConditions)
            .populate("commodity", "en_name hil_name") // Fetch `en_name` and `hil_name`
            .lean();

        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.viewUserOrders = async (req, res) => {
    try {
        const userId = req.user.id; // Get authenticated user ID

        // Find user to check their role
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        let filter = {};

        // If farmer, get orders where they are the winning bidder
        if (user.role === "Farmer") {
            filter = { "winning_bid.farmer_id": userId };
        }
        // If contractor, get orders they created
        else if (user.role === "Contractor") {
            filter = { contractor_id: userId };
        } else {
            return res.status(403).json({ error: "Access denied. Invalid role." });
        }

        // Retrieve orders based on role
        const orders = await Order.find(filter)
            .populate("commodity", "en_name hil_name")
            .lean();

        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;
        const status = req.body.status;

        // Check if order exists
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ error: "Order not found" });

        // Only the farmer can update the status
        if (!order.winning_bid || order.winning_bid.farmer_id.toString() !== userId) {
            return res.status(403).json({ error: "Unauthorized to update order status" });
        }

        // Prevent updating to completed or canceled directly
        if (status === "Completed" || status === "Canceled") {
            return res.status(400).json({ error: "Cannot set order to completed or canceled manually" });
        }

        // Update order status directly
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status: status },
            { new: true, runValidators: true }
        );

        if (!updatedOrder) {
            return res.status(500).json({ error: "Failed to update order status" });
        }

        res.json({ message: "Order status updated successfully", order: updatedOrder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports.cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ error: "Order not found" });

        // Only the contractor or farmer can cancel the order
        if (order.contractor_id.toString() !== userId &&
            (!order.winning_bid || order.winning_bid.farmer_id.toString() !== userId)) {
            return res.status(403).json({ error: "Unauthorized to cancel this order" });
        }

        // Only allow cancellation if order is still pending
        if (order.status !== "Pending") {
            return res.status(400).json({ error: "Only pending orders can be canceled" });
        }

        // Update order as canceled
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { canceled: true },
            { new: true, runValidators: true }
        );

        res.json({ message: "Order has been canceled", order: updatedOrder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.confirmOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ error: "Order not found" });

        // Only the contractor can confirm the order
        if (order.contractor_id.toString() !== userId) {
            return res.status(403).json({ error: "Only the contractor can confirm this order" });
        }

        // If the order is not delivered, prevent confirmation
        if (order.status !== "Delivered") {
            return res.status(400).json({ error: "Order must be delivered before confirmation" });
        }

        // Confirm the order and mark it as completed
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { confirmed: true, completed: true },
            { new: true, runValidators: true }
        );

        res.json({ message: "Order has been confirmed and completed", order: updatedOrder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



