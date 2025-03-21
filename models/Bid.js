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
    contract_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contract",
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Bid", bidSchema);
