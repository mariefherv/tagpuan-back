const User = require("../models/User");

module.exports.viewAllFarmers = async (req, res) => {
    try {
        const filters = {};

        if (req.query.commodity) {
            const commodities = Array.isArray(req.query.commodity)
                ? req.query.commodity
                : [req.query.commodity]; // Convert to array if not already
            filters["farmer_details.commodity"] = { $in: commodities };
        }

        if (req.query.paymentTerms) {
            filters["farmer_details.paymentTerms"] = req.query.paymentTerms;
        }

        if (req.query.modeOfDelivery) {
            filters["farmer_details.modeOfDelivery"] = req.query.modeOfDelivery;
        }

        const farmers = await User.find({ role: "Farmer", ...filters });
        res.json(farmers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
