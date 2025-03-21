const express = require("express");
const router = express.Router();
const userController = require("../controllers/userControllers");
const auth = require("../auth");
const upload = require("../multer.js");

// Public routes
router.post("/register", upload.fields([{ name: "front_id", maxCount: 1 }, { name: "back_id", maxCount: 1 }]), userController.registerUser);
router.post("/login", userController.loginUser);

// Protected routes (requires authentication)
router.get("/profile", auth.verify, userController.getUserDetails);
router.get("/all", auth.verify, auth.verifyAdmin, userController.getAllUsers);
router.put("/change-password", auth.verify, userController.changePassword);
router.put("/role/:userId", auth.verify, auth.verifyAdmin, userController.changeUserRole);
router.put("/verify/:userId", auth.verify, auth.verifyAdmin, userController.verifyUser);
router.put("/deny/:userId", auth.verify, auth.verifyAdmin, userController.denyVerification);

module.exports = router;