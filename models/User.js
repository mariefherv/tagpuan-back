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
        enum: ["Contractor", "Farmer", "Vendor", "Admin"],
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
    },
    agricoin: {
        type: Number,
        default: 0,
        required: true
    },
    profile_picture: {
        type: String, // Base64 string
        default: ""
    },
    isOnline: { type: Boolean, default: false },
    last_login: { type: Date }
}, { timestamps: true });

userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ "farmer_details.commodity": 1 });

// Pre-save middleware to enforce admin restrictions
userSchema.pre("save", async function (next) {
    if (!this.isModified("role") && !this.isModified("agricoin")) {
        return next(); // Skip if role and agricoin are not modified
    }

    // Ensure the current user role is available (to be set manually in the request handling)
    const currentUserRole = this._currentUserRole; 

    if (!currentUserRole) {
        return next(new Error("Current user role must be provided"));
    }

    // Restrict non-admins from setting role to Admin
    if (this.isModified("role") && this.role === "Admin" && currentUserRole !== "Admin") {
        return next(new Error("Only an Admin can create or modify an Admin user"));
    }

    // Restrict non-admins from modifying agricoin balance
    if (this.isModified("agricoin") && currentUserRole !== "Admin") {
        return next(new Error("Only an Admin can modify the Agricoin balance"));
    }

    next();
});

module.exports = mongoose.model("User", userSchema);
