/*
    Model for orders
*/
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    contractor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    commodity: {
        type: String,
        required: true
    },
    order_type: {
        type: String,
        enum: ["Single", "Bulk"],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    duration: {
        type: String,
        enum: ["Single", "Weekly", "Monthly"],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    payment_terms: {
        type: String,
        enum: ["Cash on Delivery", "Digital Bank", "E-Wallet (GCash/Maya)"],
        required: true
    },
    place_of_delivery: {
        type: String,
        required: true
    },
    logistics: {
        type: String,
        enum: ["Pick-up", "Delivery"],
        required: true
    },
    schedule: {
        type: Date,
        required: true
    },
    // Winning bid is optional
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
        date: Date,
    }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
