const Bid = require("../models/Bid");
const Order = require("../models/Order");


module.exports.createBid = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Check if the user has the role "Farmer"
        if (req.user.role !== "Farmer") {
            return res.status(403).json({ error: "Unauthorized: Only farmers can place bids" });
        }

        const bid = new Bid({ farmer_id: req.user.id, order_id: orderId });
        await bid.save();
        res.status(201).json(bid);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports.viewAllBids = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        // Find the order and check if the logged-in user is the contractor
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        if (order.contractor_id.toString() !== userId) {
            return res.status(403).json({ error: "Unauthorized access" });
        }

        // Retrieve bids if user is authorized, populating farmer details and order commodity
        const bids = await Bid.find({ order_id: orderId })
            .populate("farmer_id", "first_name last_name") // Farmer details
            .populate({
                path: "order_id",
                select: "commodity",
                populate: {
                    path: "commodity",
                    select: "en_name hil_name",
                },
            })
            .lean();

        res.json(bids);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports.viewBid = async (req, res) => {
    try {
        const userId = req.user.id; // Logged-in user ID

        // Find the bid and populate the order, contractor, and farmer details
        const bid = await Bid.findById(req.params.id)
            .populate({
                path: "order_id",
                select: "contractor_id",
                populate: {
                    path: "contractor_id",
                    select: "first_name last_name"
                }
            }) // Populate contractor details
            .populate("farmer_id", "first_name last_name") // Populate farmer details
            .lean();

        if (!bid) {
            return res.status(404).json({ error: "Bid not found" });
        }

        // Check if the logged-in user is either the contractor or the farmer
        if (bid.farmer_id._id.toString() !== userId && bid.order_id.contractor_id._id.toString() !== userId) {
            return res.status(403).json({ error: "Unauthorized access" });
        }

        res.json(bid);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

