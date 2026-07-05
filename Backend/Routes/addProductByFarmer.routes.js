const express = require("express");

const addProductByFarmerRoute = express.Router();

const { AddProductByFarmerModel } = require("../Models/addProductByFarmer.model");
const { UserModel } = require("../Models/user.model");
const { cartItemModel } = require("../Models/addToCart.model");

// middleware
const { Authentication } = require("../Middlewares/auth.middleware");
const { BuyerProfileModel } = require("../Models/buyerProfile.model");

// healthy test for endpoint-working 
addProductByFarmerRoute.get("/home", (req, res) => {
    res.json({ message: "This is home endpoint from AddProductByFarmer" });
});

// add new product by Farmer
addProductByFarmerRoute.post("/add-productByFarmer", Authentication(["farmer"]), async (req, res) => {
    try {
        const userId = req.userID;
        const role = req.role;
        if (role !== "farmer") {
            return res.status(403).json({ message: "Access denied. Only users with the 'farmer' role can add products.", });
        }
        const farmer = await UserModel.findOne({ _id: userId, role: "farmer" });
        if (!farmer) {
            return res.status(404).json({ message: "Farmer not found. Please make sure you are logged in as a registered farmer.", });
        }

        // Check for duplicate product
        // Normalize input values
        const { name, harvestDate } = req.body;
        const normalizedName = name.trim().toLowerCase();
        const normalizedHarvestDate = new Date(harvestDate);

        // Check for duplicate product by same farmer
        const isDuplicate = await AddProductByFarmerModel.findOne({
            farmerId: userId,
            name: { $regex: new RegExp(`^${normalizedName}$`, 'i') }, // case-insensitive
            harvestDate: normalizedHarvestDate,
        });

        if (isDuplicate) {
            return res.status(409).json({
                message: "Duplicate entry detected. This product is already listed by you.",
            });
        }

        const newProduct = await AddProductByFarmerModel.create({ farmerId: userId, ...req.body, });
        return res.status(201).json({ message: "Product successfully listed on the platform.", newProduct });

    } catch (error) {
        console.error("Error adding product by farmer:", error);
        return res.status(500).json({ message: "An unexpected error occurred while listing the product.", error: error.message, });
    }
});

// Products listed on the platform
addProductByFarmerRoute.get("/get-productByFarmer", Authentication(["farmer"]), async (req, res) => {
    try {
        const userId = req.userID;
        const role = req.role;
        if (role !== "farmer") {
            return res.status(403).json({ message: "Access denied. Only users with the 'farmer' role can get products.", });
        }
        const farmer = await UserModel.findOne({ _id: userId, role: "farmer" });
        if (!farmer) {
            return res.status(404).json({ message: "Farmer not found. Please make sure you are logged in as a registered farmer.", });
        }
        const getAllProduct = await AddProductByFarmerModel.find({ farmerId: userId });
        return res.status(201).json({ message: "Products listed on the platform.", getAllProduct });

    } catch (error) {
        console.error("Error getting product by farmer:", error);
        return res.status(500).json({ message: "An unexpected error occurred while getting the product.", error: error.message, });
    }
});

// products details updateing
addProductByFarmerRoute.patch("/update-productByFarmer/:productID", Authentication(["farmer"]), async (req, res) => {
    try {
        const { productID } = req.params
        const userId = req.userID;
        const role = req.role;
        if (role !== "farmer") {
            return res.status(403).json({ message: "Access denied. Only users with the 'farmer' role can update products.", });
        }
        const farmer = await UserModel.findOne({ _id: userId, role: "farmer" });
        if (!farmer) {
            return res.status(404).json({ message: "Farmer not found. Please make sure you are logged in as a registered farmer.", });
        }
        const updateParticularProduct = await AddProductByFarmerModel.findOneAndUpdate({ _id: productID, farmerId: userId }, { ...req.body }, { new: true });
        return res.status(201).json({ message: "Products detail's updated sucesfully.", updateParticularProduct });

    } catch (error) {
        console.error("Error updating product by farmer:", error);
        return res.status(500).json({ message: "An unexpected error occurred while updating the product.", error: error.message, });
    }
});

// delete product by Farmer
addProductByFarmerRoute.delete("/delete-productByFarmer/:productID", Authentication(["farmer"]), async (req, res) => {
    try {
        const { productID } = req.params
        const userId = req.userID;
        const role = req.role;
        if (role !== "farmer") {
            return res.status(403).json({ message: "Access denied. Only users with the 'farmer' role can delete products.", });
        }
        const farmer = await UserModel.findOne({ _id: userId, role: "farmer" });
        if (!farmer) {
            return res.status(404).json({ message: "Farmer not found. Please make sure you are logged in as a registered farmer.", });
        }
        const deleteParticularProduct = await AddProductByFarmerModel.findOneAndDelete({ _id: productID, farmerId: userId });
        return res.status(201).json({ message: `Product_ID: ${productID}, no longer exists. It's deleted.`, deleteParticularProduct });

    } catch (error) {
        console.error("Error updating product by farmer:", error);
        return res.status(500).json({ message: "An unexpected error occurred while updating the product.", error: error.message, });
    }
});

// Request to buy products by Buyer
addProductByFarmerRoute.get("/requestToBuyProducts", Authentication(["farmer"]), async (req, res) => {
    try {
        const user_id = req.userID;
        const role = req.role;
        if (!["farmer"].includes(role)) {
            return res.status(403).json({ message: "Access denied. Only farmers allowed." });
        }
        const userExists = await UserModel.findOne({ _id: user_id, role: "farmer" });
        if (!userExists) {
            return res.status(404).json({ message: "User, Role=Farmer not found." });
        }

        const checkProducts = await AddProductByFarmerModel.find({ farmerId: user_id, status: "unavailable" }) // Check if farmer has products;
        const checkProductIds = await cartItemModel.find({ "products.productId": { $in: checkProducts.map(p => p._id) } }).populate("userId") // Check if any of those products are in any cart
        const additionalBuyerInfo = await BuyerProfileModel.find({ userId: { $in: checkProductIds.map(p => p.userId._id) } }) // get additional info of those buyers
        // console.log(checkProductIds)
        // console.log(additionalInfo)
        return res.status(200).json({
            message: "Buyers interested in your unavailable products.",
            additionalBuyerInfo,
            checkProductIds, checkProducts
        });
    } catch (error) {
        console.error("Error fetching buyer requests:", error);
        return res.status(500).json({ message: "Internal server error.", error: error.message });
    }
}
);

module.exports = { addProductByFarmerRoute };
