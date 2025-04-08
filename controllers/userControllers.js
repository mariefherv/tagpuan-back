const User = require("../models/User");
const bcrypt = require("bcryptjs");
const auth = require("../auth");
const mongoose = require("mongoose")

// Convert buffer to base64
const bufferToBase64 = (buffer) => {
    return buffer.toString("base64");
};

module.exports.registerUser = async (req, res) => {
    try {
        const { password, farmer_details, role } = req.body;
        const hashedPw = await bcrypt.hash(password, 10);

        // Ensure files are uploaded
        if (!req.files || !req.files.front_id || !req.files.back_id) {
            return res.status(400).json({ message: "Front and back ID images are required" });
        }

        // Convert images to base64
        const frontBase64 = bufferToBase64(req.files.front_id[0].buffer);
        const backBase64 = bufferToBase64(req.files.back_id[0].buffer);

        // Validate role (only allow Farmer, Contractor, or Vendor)
        const allowedRoles = ["Farmer", "Contractor", "Vendor"];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ error: "Invalid role. Allowed roles: Farmer, Contractor, Vendor" });
        }
        
        // Parse farmer_details safely
        let parsedFarmerDetails = {};
        if (farmer_details) {
            try {
                let details = typeof farmer_details === "string" ? JSON.parse(farmer_details) : farmer_details;

                parsedFarmerDetails = {
                    commodity: Array.isArray(details.commodity)
                        ? details.commodity.map(id => mongoose.Types.ObjectId.createFromHexString(id.trim()))
                        : [],
                    modeOfDelivery: Array.isArray(details.modeOfDelivery)
                        ? details.modeOfDelivery.map(mode => mode.trim())
                        : [],
                    paymentTerms: Array.isArray(details.paymentTerms)
                        ? details.paymentTerms.map(term => term.trim())
                        : []
                };
            } catch (parseError) {
                return res.status(400).json({ error: "Invalid farmer_details format. Ensure it is valid JSON." });
            }
        }

        // Create new user
        const user = new User({
            ...req.body,
            password: hashedPw,
            farmer_details: parsedFarmerDetails,
            verification: {
                front_id: frontBase64,
                back_id: backBase64,
                status: "Pending"
            }
        });

        await user.save();
        res.status(201).json({ message: "Registration successful!" });

    } catch (error) {
        res.status(500).json({ error: "Server error: " + error.message });
    }
};


module.exports.loginUser = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        // Update user online status and last login timestamp
        user.isOnline = true;
        user.last_login = new Date();
        await user.save();

        res.json({ accessToken: auth.createAccessToken(user) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.logoutUser = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming you have user authentication middleware

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update user status
        user.isOnline = false;
        user.last_logout = new Date();
        await user.save();

        res.json({ message: "User logged out successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.user.id, {password: 0});
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId, {password: 0});
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, {password: 0}); // Include all details except password
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Compare old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(403).json({ error: "Incorrect old password." });
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();

        res.status(200).json({ message: "Password changed successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Server error: " + error.message });
    }
};

module.exports.changeUserRole = async (req, res) => {
    try {
        if (req.user.role !== "Admin") {
            return res.status(403).json({ error: "Only an Admin can change user roles." });
        }

        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { role: req.body.role },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "User role updated successfully", user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


module.exports.verifyUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { 
                is_verified: true,
                "verification.status": "Approved"
            },
            {   new: true,
                projection: { password: 0 }
            },

        );

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            message: "User verified successfully",
            user,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports.denyVerification = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { 
                is_verified: false,
                "verification.status": "Rejected"
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            message: "User verification rejected",
            user,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


module.exports.editUser = async (req, res) => {
    try {
        const existingUser = await User.findById(req.user.id);
        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }

        let profile_pic = existingUser.profile_picture;
        if (req.files && req.files.profile_pic) {
            profile_pic = bufferToBase64(req.files.profile_pic[0].buffer);
        }

        // Prevent role modification unless by an Admin
        if (req.body.role && req.user.role !== "Admin") {
            return res.status(403).json({ error: "Only an Admin can change user roles." });
        }

        // Prevent agricoin modification unless by an Admin
        if (req.body.agricoin && req.user.role !== "Admin") {
            return res.status(403).json({ error: "Only an Admin can modify agricoin balance." });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { ...req.body, profile_picture: profile_pic },
            { new: true }
        );

        res.json({ message: "User profile updated successfully", user: updatedUser });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


