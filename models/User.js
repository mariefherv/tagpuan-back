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
        enum: ["Contractor", "Farmer", "Vendor"],
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
        commodity: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Commodity"
        }],
        paymentTerms: {
            type: [String],
            enum: ["Cash on Delivery", "E-Wallet (GCash/Maya)", "Digital Bank Transfer"],
            default: []
        },
        modeOfDelivery: {
            type: [String],
            enum: ["Pickup", "Delivery"],
            default: []
        }
    },
    verification: {
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending"
        },
        date_applied: {
            type: Date,
            default: Date.now
        },
        date_response: Date,
        front_id: {
            type: String, // Base64 string
            default: ""
        },
        back_id: {
            type: String, // Base64 string
            default: ""
        }
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
