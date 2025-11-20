
/**
 * REAL EMAIL BACKEND SERVER CODE
 * 
 * Since the browser cannot send SMTP emails directly for security reasons,
 * you need a small backend server.
 * 
 * Instructions:
 * 1. Create a new folder for your backend.
 * 2. Run `npm init -y`
 * 3. Run `npm install express nodemailer cors dotenv`
 * 4. Save this file as `server.js`
 * 5. Run `node server.js`
 */

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors()); // Allow requests from your frontend

// 1. CONFIGURE YOUR EMAIL SERVICE HERE
// This is where you set up info@vizzil.net
const transporter = nodemailer.createTransport({
    host: "mail.vizzil.net", // Replace with your actual SMTP host (e.g., smtp.gmail.com or your hosting provider)
    port: 465,               // 465 for SSL, 587 for TLS
    secure: true,            // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || "info@vizzil.net",
        pass: process.env.SMTP_PASS || "YOUR_EMAIL_PASSWORD" 
    }
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log("SMTP Connection Error:", error);
    } else {
        console.log("Server is ready to send emails from info@vizzil.net");
    }
});

// API Endpoint to Send OTP
app.post('/api/send-otp', async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const mailOptions = {
        from: '"ProTrack Security" <info@vizzil.net>',
        to: email,
        subject: 'Reset Your Password - ProTrack',
        text: `Your password reset code is: ${otp}. This code expires in 15 minutes.`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc;">
                <div style="max-width: 500px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <h2 style="color: #1e293b; margin-top: 0;">Password Reset Request</h2>
                    <p style="color: #64748b;">You requested a password reset for your ProTrack account.</p>
                    <div style="margin: 30px 0; text-align: center;">
                        <span style="background-color: #e0f2fe; color: #0284c7; padding: 15px 30px; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; border: 1px solid #bae6fd;">
                            ${otp}
                        </span>
                    </div>
                    <p style="color: #64748b; font-size: 14px;">This code will expire in 15 minutes.</p>
                    <p style="color: #94a3b8; font-size: 12px; margin-top: 30px;">If you didn't request this, please ignore this email.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent successfully to ${email}`);
        res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Failed to send email. Please try again later.' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
