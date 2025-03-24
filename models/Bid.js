/*
    Model for bids
*/
const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema({
    farmer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    }
}, { timestamps: true });


bidSchema.index({ farmer_id: 1 });
bidSchema.index({ order_id: 1 });
bidSchema.index({ farmer_id: 1, order_id: 1 }, { unique: true }); // Ensures a farmer can bid only once per order

module.exports = mongoose.model("Bid", bidSchema);
