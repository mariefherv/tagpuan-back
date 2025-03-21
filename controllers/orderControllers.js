const Order = require("../models/Order");

module.exports.createOrder = async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports.viewOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
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
        const { commodity, contractType, schedule } = req.query;

        // Convert commodities to an array if it's not already
        const filterConditions = {};
        
        if (commodities) {
            filterConditions.commodity = commodity;
        }

        if (contractType) {
            filterConditions.contractType = contractType;
        }

        if (schedule) {
            filterConditions.schedule = new Date(schedule); // Convert to Date
        }

        const orders = await Order.find(filterConditions);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
