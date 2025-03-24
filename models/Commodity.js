const mongoose = require("mongoose");

const commoditySchema = new mongoose.Schema({
    en_name: {
        type: String,
        required: true,
        unique: true
    },
    hil_name: String,
    category: {
        type: String, // You can categorize like "Vegetable", "Fruit", "Meat"
        required: true,
        default: ""
    }
}, { timestamps: true });

commoditySchema.index({ en_name: 1 }, { unique: true });
commoditySchema.index({ category: 1 });

module.exports = mongoose.model("Commodity", commoditySchema);
