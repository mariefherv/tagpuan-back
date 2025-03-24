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
        default: 1,
        min: [1, "Quantity must be at least 1"]
    },
    duration: {
        type: String,
        enum: ["Single Order", "Weekly", "Monthly"],
        required: true,
        default: "Single Order"
    },
    price: {
        type: Number,
        required: true,
        min: [0, "Price must be a positive number"]
    },
    payment_terms: {
        type: String,
        enum: ["Cash on Delivery", "Digital Bank", "E-Wallet (GCash/Maya)"],
        required: true
    },
    place_of_delivery: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, "Delivery address must be at least 3 characters"],
        maxlength: [100, "Delivery address is too long"]
    },
    logistics: {
        type: String,
        enum: ["Pickup", "Delivery"],
        required: true
    },
    schedule: {
        type: Date,
        required: true,
        validate: {
            validator: function (v) {
                return v > new Date(); // Ensures schedule is in the future
            },
            message: "Schedule must be a future date"
        }
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
        date: Date,
    },
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Preparing", "On The Way", "Delivered"],
        default: "Pending"
    },
    canceled: {
        type: Boolean,
        default: false
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

orderSchema.pre("save", function (next) {
    if (this.canceled && this.status !== "Pending") {
        return next(new Error("Canceled orders cannot have an active status."));
    }
    next();
});

orderSchema.index({ contractor_id: 1 });
orderSchema.index({ commodity: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ schedule: 1 });
orderSchema.index({ "winning_bid.farmer_id": 1 });

module.exports = mongoose.model("Order", orderSchema);
