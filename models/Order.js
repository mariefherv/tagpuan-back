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
        type: mongoose.Schema.Types.ObjectId,
        ref: "Commodity",
        required: true
    },
    order_type: {
        type: String,
        enum: ["Single", "Bulk"],
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    duration: {
        type: String,
        enum: ["Single Order", "Weekly", "Monthly"],
        required: true,
        default: "Single Order"
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
        enum: ["Pickup", "Delivery"],
        required: true
    },
    schedule: {
        type: Date,
        required: true,
        set: v => new Date(v)
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
    },
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Rejected", "Preparing", "On The Way", "Delivered"],
        default: "Pending"
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    completed: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
