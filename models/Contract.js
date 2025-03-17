/*
    Model for contracts
*/
const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema({
    contractor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    crop_type: {
        type: String,
        required: true
    },
    contract_type: {
        type: String,
        enum: ["fixed-price", "volume-based"],
        required: true
    },
    quantity: Number,
    duration: Number, 
    price: Number,
    payment_terms: {
        type: String,
        enum: ["Cash on Delivery", "Digital Bank", "E-Wallet (GCash/Maya)"]
    },
    place_of_delivery: String,
    logistics: String,
    date: {
        type: Date,
        default: Date.now
    },
    winning_bid: {
        bid_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bid"
        },
        farmer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        price: Number,
        date_applied: Date,
        date_response: Date
    }
}, { timestamps: true });

module.exports = mongoose.model("Contract", contractSchema);
