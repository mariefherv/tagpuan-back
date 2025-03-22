const Order = require("../models/Order");
const User = require("../models/User");

module.exports.createOrder = async (req, res) => {
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
            filterConditions.schedule = new Date(schedule); // Convert schedule to Date
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



