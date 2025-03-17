/*
    Model for users
*/
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    is_verified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ["contractor", "farmer", "vendor", "admin"],
        required: true
    },
    first_name: {
        type: String,
        required: [true, "First name is required"],
    },
    last_name: {
        type: String,
        required: [true, "Last name is required"],
    },
    middle_name: String,
    suffix: String,
    farmer_details: {
        commodity: String,
        land_area: Number
    },
    verification: {
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },
        date_applied: Date,
        date_response: Date
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
