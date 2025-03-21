const Commodity = require("../models/Commodity");

module.exports.getAllCommodities = async (req, res) => {
    try {
        const commodities = await Commodity.find({}, "en_name hil_name category");
        res.json(commodities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports.addCommodity = async (req, res) => {
    try {
        const { en_name, hil_name, category } = req.body;

        // Check if commodity already exists
        const existingCommodity = await Commodity.findOne({ en_name });
        if (existingCommodity) {
            return res.status(400).json({ message: "Commodity already exists" });
        }

        // Create a new commodity
        const newCommodity = new Commodity({
            en_name,
            hil_name: hil_name || "", // Default to empty string if not provided
            category
        });

        // Save to database
        await newCommodity.save();

        res.status(201).json({ message: "Commodity added successfully", commodity: newCommodity });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};