export const verifyOtpSms = (req, res) => {
    const { phone, enteredOtp } = req.body;
    const storedOtp = global.otpStore.get(phone);
  
    if (storedOtp && storedOtp === Number(enteredOtp)) {
      global.otpStore.delete(phone); // Remove OTP after verification
      return res.json({ success: true, message: 'OTP verified successfully!' });
    }
  
    res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  };