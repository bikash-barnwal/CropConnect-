const express = require("express");

const farmerProfileRouter = express.Router();

const nodemailer = require("nodemailer");
require("dotenv").config()

const { FarmerProfileModel } = require("../Models/farmerProfile.model");
const { UserModel } = require("../Models/user.model");

// middleware
const { Authentication } = require("../Middlewares/auth.middleware")

farmerProfileRouter.get("/home", (req, res) => {
    res.json({ message: "This is home endpoint route from FarmerProfile." });
});

farmerProfileRouter.post("/add-farmerProfile", Authentication(["farmer"]), async (req, res) => {
    try {
        const userID = req.userID
        const role = req.role
        const user = await UserModel.findById(userID)
        if (user.role != role || role != "farmer") {
            return res.status(404).json({ message: `Only users with the 'farmer' role can create a farmer profile.` })
        }
        // restrict from duplicate profile creation
        const isAlreadyCreatedProfile = await FarmerProfileModel.findOne({ userId: userID })
        if (isAlreadyCreatedProfile) {
            return res.status(409).json({ message: "Profile already exists. Duplicate profile creation is not allowed." });
        }
        const createFarmerProfile = await FarmerProfileModel.create({ userId: userID, ...req.body })
        // Implement NodeMailer so, that for every new order_buyer receive an Email, for confirmation of order
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
            subject: "✔ You have created a profile on CropConnect.",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
                    <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h2 style="color: #28a745;">🎉 Welcome to CropConnect!</h2>
                    <p style="font-size: 16px;">Hello <b>${user.name}</b>,</p>
                    <p style="font-size: 15px;">Your profile has been successfully created on <strong>CropConnect</strong>.</p>

                    <hr style="margin: 20px 0;" />

                    <h3 style="color: #333;">📄 Profile Details</h3>
                    <p><b>🧑 Role:</b> Farmer</p>
                    <p><b>🆔 Unique(Farmer) Profile ID:</b> ${createFarmerProfile._id}</p>
                    <p><b>📞 Phone:</b> ${createFarmerProfile.phone}</p>
                    <p><b>🏠 Address:</b> ${createFarmerProfile.location?.city || 'N/A'}</p>
                    <p><b>📍 State:</b> ${createFarmerProfile.location?.state || 'N/A'}</p>
                    <p><b>🗓️ Profile Created At:</b> ${createFarmerProfile.createdAt}</p>
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

        return res.status(200).json({ message: `Hi ${user.name}, your farmer profile has been created successfully!`, createFarmerProfile })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Something went wrong.", error })
    }
})

// Get profile image
farmerProfileRouter.get("/profile-image/:userId", async (req, res) => {
    try {
        const { userId } = req.params
        // Find farmer profile by userId
        const farmer = await FarmerProfileModel.findOne({ userId })
        if (!farmer) {
            return res.status(404).json({ message: "Profile not found" })
        }
        res.json({ profileImage: farmer.profileImage || null })
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
})


// Update profile image
farmerProfileRouter.put("/update-profile-image", async (req, res) => {
    try {
        const { userId, profileImage } = req.body
        if (!userId || !profileImage) {
            return res.status(400).json({ message: "UserId and profileImage are required" })
        }
        // Update or create farmer profile with new image
        const farmer = await FarmerProfileModel.findOneAndUpdate({ userId }, { profileImage }, { new: true, upsert: true })
        res.json({
            message: "Profile image updated successfully",
            profileImage: farmer.profileImage,
        })
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
})

farmerProfileRouter.patch("/update-farmerProfile", Authentication(["farmer"]), async (req, res) => {
    try {
        const userID = req.userID
        const role = req.role
        const user = await UserModel.findById(userID)
        if (user.role != role || role != "farmer") {
            return res.status(404).json({ message: `Only users with the 'farmer' role can create a farmer profile.` })
        }
        const updateFarmerProfile = await FarmerProfileModel.findOneAndUpdate({ userId: userID }, { userId: userID, ...req.body }, { new: true })
        return res.status(200).json({ message: `Hi ${user.name}, your farmer profile has been updated successfully!`, updateFarmerProfile })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Something went wrong.", error })
    }
})

farmerProfileRouter.get("/get-farmerProfile", Authentication(["farmer"]), async (req, res) => {
    try {
        const userID = req.userID
        const role = req.role
        const user = await UserModel.findById(userID)
        if (user.role != role || role != "farmer") {
            return res.status(404).json({ message: `Only users with the 'farmer' role able to access this profile.` })
        }
        const getFarmerProfile = await FarmerProfileModel.find()
        return res.status(200).json({ message: `Hi ${user.name}, it's your Farmer profile.`, getFarmerProfile })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Something went wrong.", error })
    }
})

module.exports = { farmerProfileRouter };



