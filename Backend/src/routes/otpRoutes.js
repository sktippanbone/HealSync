const { Router } = require("express");
const { sendOTP, verifyOTP } = require("../controllers/otpController");

const router = Router();

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

module.exports = router;