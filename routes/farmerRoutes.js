const express = require("express");
const router = express.Router();
const farmerController = require("../controllers/farmerControllers");
const auth = require("../auth");

// Private routes
router.get("/find", auth.verify, farmerController.viewAllFarmers);

module.exports = router;