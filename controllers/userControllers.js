const User = require("../models/User");
const bcrypt = require("bcrypt");
const auth = require("../auth");

// Convert buffer to base64
const bufferToBase64 = (buffer) => {
    return buffer.toString("base64");
};

module.exports.registerUser = async (req, res) => {
    try {
        const { password } = req.body;
        const hashedPw = bcrypt.hashSync(password, 10);

        // Check if files are uploaded
        if (!req.files || !req.files.front_id || !req.files.back_id) {
            return res.status(400).json({ message: "Front and back ID images are required" });
        }

        // Convert images to base64
        const frontBase64 = bufferToBase64(req.files.front_id[0].buffer);
        const backBase64 = bufferToBase64(req.files.back_id[0].buffer);

        // Create new user
        const user = new User({
            ...req.body,
            password: hashedPw,
            verification: {
                front_id: frontBase64,
                back_id: backBase64,
                status: "Pending"
            }
        });

        await user.save();
        res.status(201).json({ message: "Registration successful!" });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


module.exports.loginUser = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        res.json({ accessToken: auth.createAccessToken(user) });
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
            return res.status(401).json({ error: "Incorrect old password." });
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
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { role: req.body.role },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            message: "User role updated successfully",
            user,
        });
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
        // Fetch the existing user
        const existingUser = await User.findById(req.user.id);
        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }

        let profile_pic = existingUser.profile_pic; // Preserve the current profile picture

        // Check if a new profile picture is uploaded
        if (req.files && req.files.profile_pic) {
            profile_pic = bufferToBase64(req.files.profile_pic[0].buffer);
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { ...req.body, profile_picture: profile_pic },
            { new: true }
        );

        res.json({
            message: "User profile updated successfully",
            user: updatedUser,
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

