/*
    Model for items
*/
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    marketplace: {
        type: String,
        enum: ["Farmers", "Consumers"],
        required: true
    },
    description: String,
    price: {
        type: Number,
        required: true,
        min: [0, "Price must be a positive number"],
        default: 1
    },
    agricoin: {
        type: Number,
        required: true,
        min: [0, "Agricoin value must be a positive number"],
        default: 1
    },
    stock: {
        type: Number,
        required: true,
    }
})