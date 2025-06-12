const { Resend } = require('resend');
const dotenv = require("dotenv");
dotenv.config();
// console.log(process.env.RESEND_API_KEY)
const apiKey = process.env.RESEND_API_KEY ; 

if (!apiKey) {
  console.error('Missing Resend API key!');
  throw new Error('Resend API key is required');
}

const resend = new Resend(apiKey);

const sendOtp = async (email, otp) => {
  const htmlContent = `
    <html>
      <head>
        <title>Confirm your email address</title>
        <style>
          /* Add any global styles here if needed */
        </style>
      </head>
      <body>
        <table role="presentation" style="width: 40%; height: 40%; background-color: #FFE5C8; padding: 10px; margin: auto;">
          <tr>
            <td align="center" valign="top">
              <div class="container" style="background-color: #FFDABE; padding: 20px 15px; max-width: 400px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                <div class="logo-container" style="margin-bottom: 15px; text-align: center;">
                  <img src="https://firebasestorage.googleapis.com/v0/b/worqhat-dev.appspot.com/o/WorqHat_Logos%2FWorqHat%20Blue%20Logo.png?alt=media&token=ba6a78c1-898c-491d-b197-97b16366298e" width="120" height="36" alt="Worqhat" />
                </div>
                <h1 style="color: #1d1c1d; font-size: 24px; font-weight: 700; margin: 10px 0; line-height: 30px;">Confirm your email address</h1>
                <div style="background: #f5f4f5; border-radius: 4px; margin-bottom: 10px; padding: 15px; text-align: center;">
                  <p style="font-size: 20px; text-align: center;">${otp}</p>
                </div>
                <p style="color: #000; font-size: 12px; line-height: 18px; margin-bottom: 10px;">If you didn't request this email, you can safely ignore it.</p>
                <p style="font-size: 10px; color: #b7b7b7; text-align: center; margin-top: 20px;">©2024 Worqhat Technologies. All rights reserved.</p>
              </div>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  try {
    const response = await resend.emails.send({
      from: 'interviews@updates.worqhat.com',
      to: email,
      subject: 'Verify your email',
      html: htmlContent,  
    });
    console.log('OTP sent successfully:', response);
  } catch (error) {
    console.error('Failed to send OTP:', error);
    throw error;
  }
};



module.exports = { sendOtp };