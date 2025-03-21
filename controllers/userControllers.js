const User = require("../models/User");
const bcrypt = require("bcrypt");
const auth = require("../auth");

// Convert buffer to base64
const bufferToBase64 = (buffer) => {
    return buffer.toString("base64");
};

module.exports.registerUser = async (req, res) => {
    try {
        const { username, email, password, role, first_name, last_name, middle_name, suffix, farmer_details } = req.body;
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
            username,
            email,
            password: hashedPw,
            role,
            first_name,
            last_name,
            middle_name,
            suffix,
            farmer_details,
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
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, "_id email");
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
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
            { verified: true },
            { new: true }
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

// Uploading images


