const { sendOtp } = require("../utils/resend");
const NodeCache = require("node-cache");

// Cache to store OTPs temporarily (expiry: 5 minutes)
const otpCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

const sendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();  // Generate a 6-digit OTP
    await sendOtp(email, otp);  // Send OTP via Resend
    
    // Store OTP in cache associated with the email
    otpCache.set(email, otp);
    
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP", error });
  }
};

const verifyOTP = async (req, res) => {
  const { email, userCode } = req.body;

  try {
    // Retrieve the OTP from cache
    const cachedOtp = otpCache.get(email);

    if (cachedOtp && userCode == cachedOtp) {
      otpCache.del(email);  // Delete OTP from cache after successful verification
      res.status(200).json({ message: "OTP verified successfully" });
    } else {
      res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    res.status(500).json({ message: "OTP verification failed", error });
  }
};

module.exports = { sendOTP, verifyOTP };
