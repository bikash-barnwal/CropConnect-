const express = require("express");

const nodemailer = require("nodemailer");
require("dotenv").config()
const userRoute = express.Router();

const { UserModel } = require("../Models/user.model");
const { BlacklistedTokenModel } = require("../Models/blacklistedToken.model")

const jwt = require("jsonwebtoken")
const { Authentication } = require("../Middlewares/auth.middleware")

// healthy test endpoint
userRoute.get("/home", (req, res) => {
  res.json({ message: "This is home endpoint route." });
});

// user signup
userRoute.post("/signup", async (req, res) => {
  try {

    const isUser = await UserModel.findOne({ email: req.body.email })
    if (isUser) {
      return res.status(409).json({ message: "User already registered. Please sign in to continue." })
    }
    const user = await UserModel.create({ ...req.body })

    // send registr email and password via mail 
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.GOOGLE_EMAIL,
        pass: process.env.GOOGLE_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: '"Mr. Bikash Prasad Barnwal" <Bikash@crop.connect.com>',
      to: user.email,
      subject: "✔ You have sucessfully Register on CropConnect.",
      html: `
                   <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
                       <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                       <h2 style="color: #28a745;">🎉 Welcome to CropConnect!</h2>
                       <p style="font-size: 16px;">Hello <b>${user.name}</b>,</p>
                       <p style="font-size: 15px;">You have been successfully Registered on <strong>CropConnect</strong>.</p>
   
                       <hr style="margin: 20px 0;" />
   
                       <h3 style="color: #333;">📄 User Registration Details</h3>
                       <p><b>🧑 Role : </b> ${user.role}</p>
                       <p><b>🆔 Email : </b> ${user.email}</p>
                       <p><b>🗓️ Profile Created At:</b> ${user.createdAt}</p>
                       <hr style="margin: 20px 0;" />
                       <p style="font-size: 15px;">
                           We're excited to support your journey in agricultural trading. If you ever need help, don't hesitate to reach out.  
                           <br><br>
                           🌾 Thank you for choosing <strong>CropConnect</strong> — where farming meets technology!
                       </p>
   
                       <p style="margin-top: 30px; font-size: 14px; color: #888;">— Team CropConnect</p>
                   </div>
                   </div>
               `
    });


    return res.status(200).json({
      message: "Signup successful! Your login credentials have been sent to your email. Welcome aboard.", user
    });


  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "An unexpected error occurred. Please try again later.", error })
  }
})

// user signin
userRoute.post("/signin", async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email, password: req.body.password })
    if (!user) {
      return res.status(409).json({ message: "No account found with this email. Please sign up first." })
    }
    const token = jwt.sign({ userID: user._id, role: user.role }, process.env.SECURED_KEY)
    return res.status(200).json({ message: "Signin successful! Welcome back.", user, token })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "An unexpected error occurred. Please try again later.", error })
  }
})

// user logout
userRoute.post("/logout", Authentication(["farmer", "buyer", "admin"]), async (req, res) => {
  try {
    const userID = req.userID
    const user = await UserModel.findById(userID)
    if (!user) {
      return res.status(409).json({ message: "No account found with this userID." })
    }
    const token = req.headers?.authorization?.split(" ")[1];
    await BlacklistedTokenModel.create({ token });
    // console.log(token)
    // console.log(userID, role)
    return res.status(200).json({ message: "Logout sucessfull." })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "An unexpected error occurred. Please try again later.", error })
  }
})

// test middleware working
userRoute.get("/checkMW", Authentication(["farmer", "buyer", "admin"]), async (req, res) => {
  try {
    const userID = req.userID
    // console.log(userID, role)
    const user = await UserModel.findById(userID)
    if (!user) {
      return res.status(409).json({ message: "No account found with this userID." })
    }
    return res.status(200).json({ message: "User found successful.", user })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "An unexpected error occurred. Please try again later.", error })
  }
})

// password reset link send via mail
userRoute.post("/forgetPassword", async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email })
    if (!user) {
      return res.status(404).json({ message: `User not found.` })
    }
    const token = jwt.sign({ userID: user._id, role: user.role }, process.env.SECURED_KEY, { expiresIn: "5m" })

    const resetLink = `${process.env.CLIENT_BASE_URL}/user/resetPassword/?token=${token}`

    // send registr email and password via mail 
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.GOOGLE_EMAIL,
        pass: process.env.GOOGLE_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: '"Mr. Bikash Prasad Barnwal" <Bikash@crop.connect.com>',
      to: user.email,
      subject: "🔐 Password Reset Instructions | CropConnect",
      html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
        <h2 style="color: #2E7D32; margin-bottom: 10px;">Password Reset Request</h2>
        <p style="font-size: 16px; color: #333;">Hi <strong>${user.name}</strong>,</p>
        <p style="font-size: 15px; color: #333;">
          We received a request to reset the password associated with your <strong>CropConnect</strong> account.
        </p>
        <p style="font-size: 15px; color: #333;">
          To reset your password, please click the button below. This link will expire in <strong>5 minutes</strong> for security reasons.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #2E7D32; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-size: 16px;">Reset Your Password</a>
        </div>
        <p style="font-size: 14px; color: #555;">
          If the button doesn't work, copy and paste the following link into your browser:
        </p>
        <p style="font-size: 14px; color: #555;"><a href="${resetLink}" style="color: #2E7D32;">Password reset link</a></p>
        <hr style="margin: 30px 0;" />
        <h4 style="color: #333;">Your Account Details:</h4>
        <p style="font-size: 14px; color: #333;"><strong>Email:</strong> ${user.email}</p>
        <p style="font-size: 14px; color: #333;"><strong>Role:</strong> ${user.role}</p>
        <hr style="margin: 30px 0;" />
        <p style="font-size: 14px; color: #888;">
          If you didn’t request this password reset, you can safely ignore this email. Your account will remain secure.
        </p>

        <p style="margin-top: 30px; font-size: 14px; color: #888;">— The CropConnect Team</p>
      </div>
    </div>
  `
    });
    return res.status(200).json({ message: `Password reset link send via mail`, resetLink })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Something went wrong while requesting forgetPassword request.", error })
  }
})

// follow link send on mail user are allowed  to reset password any number of time
userRoute.post("/resetPassword", async (req, res) => {
  // console.log("hio")
  try {
    const { token, password } = req.body;
    // console.log("BODY:", ...req.body);

    if (!token) {
      return res.status(400).json({ message: "Token is required." });
    }

    // Check if token is blacklisted
    const isBlacklistedToken = await BlacklistedTokenModel.findOne({ token });
    if (isBlacklistedToken) {
      return res.status(409).json({ message: "This password reset link has already been used. Please request a new one." });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.SECURED_KEY);
    const userId = decoded.userID;

    // Blacklist the token to prevent reuse
    await BlacklistedTokenModel.create({ token });

    // Update user password
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { password },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      message: "Your password has been successfully updated.",
      user,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while trying to reset the password.",
      error: error.message,
    });
  }
});



module.exports = { userRoute };
