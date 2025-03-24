/*
    Model for item orders
*/
const mongoose = require("mongoose");

const itemOrderSchema = new mongoose.Schema({
    buyer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    item_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: [0, "Price must be a positive number"]
    },
    payment_method: {
        type: String,
        required: true,
        enum: ["PHP", "agricoin"]
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
    status: {
        type: String,
        enum: ["Pending", "Preparing", "On The Way", "Delivered"],
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

itemOrderSchema.index({ buyer_id: 1 });
itemOrderSchema.index({ item_id: 1 });
itemOrderSchema.index({ status: 1 });
itemOrderSchema.index({ place_of_delivery: 1 });

module.exports = mongoose.model("ItemOrder", itemOrderSchema);
