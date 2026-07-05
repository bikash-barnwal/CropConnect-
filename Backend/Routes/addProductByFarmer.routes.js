const express = require("express");

const addProductByFarmerRoute = express.Router();

const { AddProductByFarmerModel } = require("../Models/addProductByFarmer.model");
const { cartItemModel } = require("../Models/addToCart.model");
const { BuyerProfileModel } = require("../Models/buyerProfile.model");

// middleware
const { Authentication } = require("../Middlewares/auth.middleware");

// helpers
const { sendResponse } = require("../Utils/responseHelper");
const { validateProductBody, validateProductUpdateBody } = require("../Utils/validators");

// healthy test for endpoint-working 
addProductByFarmerRoute.get("/home", (req, res) => {
    return sendResponse(res, 200, true, "This is home endpoint from AddProductByFarmer");
});

// add new product by Farmer
addProductByFarmerRoute.post("/add-productByFarmer", Authentication(["farmer"]), async (req, res) => {
    try {
        const userId = req.userID;
        const role = req.role;
        if (role !== "farmer") {
            return sendResponse(res, 403, false, "Access denied. Only users with the 'farmer' role can add products.");
        }

        // Validate request body
        const validation = validateProductBody(req.body);
        if (!validation.isValid) {
            return sendResponse(res, 400, false, "Validation failed. Please ensure all required fields are correct and no unknown fields are provided.");
        }

        // Check for duplicate product
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
            return sendResponse(res, 409, false, "Duplicate entry detected. This product is already listed by you.");
        }

        const newProduct = await AddProductByFarmerModel.create({ farmerId: userId, ...req.body });
        return sendResponse(res, 201, true, "Product successfully listed on the platform.", newProduct);

    } catch (error) {
        return sendResponse(res, 500, false, "An unexpected error occurred while listing the product.", null, {
            code: "INTERNAL_SERVER_ERROR",
            details: error.message
        });
    }
});

// Products listed on the platform
addProductByFarmerRoute.get("/get-productByFarmer", Authentication(["farmer"]), async (req, res) => {
    try {
        const userId = req.userID;
        const role = req.role;
        if (role !== "farmer") {
            return sendResponse(res, 403, false, "Access denied. Only users with the 'farmer' role can get products.");
        }

        const getAllProduct = await AddProductByFarmerModel.find({ farmerId: userId });
        return sendResponse(res, 200, true, "Products listed on the platform.", getAllProduct);

    } catch (error) {
        return sendResponse(res, 500, false, "An unexpected error occurred while getting the product.", null, {
            code: "INTERNAL_SERVER_ERROR",
            details: error.message
        });
    }
});

// products details updating
addProductByFarmerRoute.patch("/update-productByFarmer/:productID", Authentication(["farmer"]), async (req, res) => {
    try {
        const { productID } = req.params;
        const userId = req.userID;
        const role = req.role;
        if (role !== "farmer") {
            return sendResponse(res, 403, false, "Access denied. Only users with the 'farmer' role can update products.");
        }

        // Validate update request body
        const validation = validateProductUpdateBody(req.body);
        if (!validation.isValid) {
            return sendResponse(res, 400, false, "Validation failed. Please ensure all fields are correct and no unknown fields are provided.");
        }

        const updateParticularProduct = await AddProductByFarmerModel.findOneAndUpdate(
            { _id: productID, farmerId: userId },
            { ...req.body },
            { new: true }
        );

        if (!updateParticularProduct) {
            return sendResponse(res, 404, false, "Product not found or unauthorized.");
        }

        return sendResponse(res, 200, true, "Products detail's updated sucesfully.", updateParticularProduct);

    } catch (error) {
        return sendResponse(res, 500, false, "An unexpected error occurred while updating the product.", null, {
            code: "INTERNAL_SERVER_ERROR",
            details: error.message
        });
    }
});

// delete product by Farmer
addProductByFarmerRoute.delete("/delete-productByFarmer/:productID", Authentication(["farmer"]), async (req, res) => {
    try {
        const { productID } = req.params;
        const userId = req.userID;
        const role = req.role;
        if (role !== "farmer") {
            return sendResponse(res, 403, false, "Access denied. Only users with the 'farmer' role can delete products.");
        }

        const deleteParticularProduct = await AddProductByFarmerModel.findOneAndDelete({ _id: productID, farmerId: userId });
        if (!deleteParticularProduct) {
            return sendResponse(res, 404, false, "Product not found or unauthorized.");
        }

        return sendResponse(res, 200, true, `Product_ID: ${productID}, no longer exists. It's deleted.`, deleteParticularProduct);

    } catch (error) {
        return sendResponse(res, 500, false, "An unexpected error occurred while deleting the product.", null, {
            code: "INTERNAL_SERVER_ERROR",
            details: error.message
        });
    }
});

// Request to buy products by Buyer
addProductByFarmerRoute.get("/requestToBuyProducts", Authentication(["farmer"]), async (req, res) => {
    try {
        const user_id = req.userID;
        const role = req.role;
        if (role !== "farmer") {
            return sendResponse(res, 403, false, "Access denied. Only farmers allowed.");
        }

        const checkProducts = await AddProductByFarmerModel.find({ farmerId: user_id, status: "unavailable" });
        const checkProductIds = await cartItemModel.find({ "products.productId": { $in: checkProducts.map(p => p._id) } }).populate("userId");
        const additionalBuyerInfo = await BuyerProfileModel.find({ userId: { $in: checkProductIds.map(p => p.userId._id) } });

        return sendResponse(res, 200, true, "Buyers interested in your unavailable products.", {
            additionalBuyerInfo,
            checkProductIds,
            checkProducts
        });
    } catch (error) {
        return sendResponse(res, 500, false, "Internal server error.", null, {
            code: "INTERNAL_SERVER_ERROR",
            details: error.message
        });
    }
});

module.exports = { addProductByFarmerRoute };
