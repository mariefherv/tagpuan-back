const Bid = require("../models/Bid");

module.exports.createBid = async (req, res) => {
    try {
        const bid = new Bid(req.body);
        await bid.save();
        res.status(201).json(bid);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports.viewAllBids = async (req, res) => {
    try {
        const bids = await Bid.find({ order_id: req.params.orderId });
        res.json(bids);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.viewBid = async (req, res) => {
    try {
        const bid = await Bid.findById(req.params.id);
        if (!bid) return res.status(404).json({ error: "Bid not found" });
        res.json(bid);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};