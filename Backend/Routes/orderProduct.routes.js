const express = require("express");

const nodemailer = require("nodemailer");
require("dotenv").config()

const orderProductRoute = express.Router();


const { FarmerProfileModel } = require("../Models/farmerProfile.model");
const { OrderProductModel } = require("../Models/orderProduct.model");
const { UserModel } = require("../Models/user.model");
const { AddProductByFarmerModel } = require("../Models/addProductByFarmer.model")
const { cartItemModel } = require("../Models/addToCart.model")
// middleware
const { Authentication } = require("../Middlewares/auth.middleware");

// healthy test for endponit working
orderProductRoute.get("/home", (req, res) => {
    res.json({ message: "This is home endpoint route from OrderProduct" });
});




// get product from cart
orderProductRoute.get('/getProductFromCart', Authentication(["buyer"]), async (req, res) => {
    try {
        const userId = req.userID
        // console.log(userId) // assuming JWT middleware adds this
        const cart = await cartItemModel.findOne({ userId })
        // console.log("Check 1")
        if (!cart) return res.status(404).json({ message: 'Cart not found' })
        // console.log("Check 2")

        const productIds = cart.products.map(p => p.productId)
        // console.log("Check 3")

        const products = await AddProductByFarmerModel.find({ _id: { $in: productIds } })
        // console.log("Check 4")

        res.json({ cart, product: products })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
})


orderProductRoute.post("/addToCart", Authentication(["buyer"]), async (req, res) => {
    try {
        const userId = req.userID;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ message: "Product ID is required." });
        }

        const product = await AddProductByFarmerModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        let cart = await cartItemModel.findOne({ userId });

        if (!cart) {
            // Create a new cart for the user
            cart = await cartItemModel.create({
                userId,
                products: [{ productId }]
            });
        } else {
            // Check if product is already in the cart
            const alreadyInCart = cart.products.some(
                (item) => item.productId.toString() === productId
            );

            if (alreadyInCart) {
                return res.status(200).json({
                    message: "Product already added to your cart.",
                    cartItem: cart,
                });
            }

            // Add the product to cart
            cart.products.push({ productId });
            await cart.save();
        }

        // Attempt to update product status to unavailable
        try {
            if (product.status !== "unavailable") {
                await AddProductByFarmerModel.updateOne(
                    { _id: productId },
                    { $set: { status: "unavailable" } }
                );
            }
        } catch (updateError) {
            console.error("Failed to update product status:", updateError.message);
            return res.status(200).json({
                message: "Product added to cart, but failed to update product status.",
                cartItem: cart,
                statusUpdateError: updateError.message,
            });
        }

        return res.status(200).json({
            message: "Product added to cart successfully.",
            cartItem: cart,
        });

    } catch (error) {
        console.error("Add to cart error:", error);
        return res.status(500).json({
            message: "An error occurred while adding to cart.",
            error: error.message,
        });
    }
});


// delete order for a  order_product endpoint
// Endpoint: /cancelOrder?productId=_id
orderProductRoute.delete("/cancelOrder/:productId", Authentication(["buyer", "admin"]), async (req, res) => {
    try {
        const userID = req.userID;
        const role = req.role;
        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({ message: "Missing required parameter: productId." });
        }
        const user = await UserModel.findById(userID);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const cart = await cartItemModel.findOne({ userId: userID });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found." });
        }
        const alreadyInCart = cart.products.some(
            (item) => item.productId.toString() === productId
        );
        if (role !== "buyer" && role !== "admin") {
            return res.status(403).json({
                message: "Access denied: Only users with 'buyer' or 'admin' roles can update an order.",
            });
        }
        // const alreadyInCart = cart.products.some(
        //     (item) => item.productId.toString() === productId
        // );
        if (!alreadyInCart) {
            return res.status(404).json({
                message: `Hello ${user.role.toUpperCase()} ${user.name}, the Product with ID '${productId}' is no longer available on the AddToCart bucket.`,
            });
        }

        const updatedCart = await cartItemModel.findOneAndUpdate({ userId: userID }, { $pull: { products: { productId } } }, { new: true });

        // update the status of that product after remove from cart. status = available
        await AddProductByFarmerModel.updateOne({ _id: productId }, { $set: { status: "available" } })

        return res.status(200).json({ message: `Hello ${user.role.toUpperCase()} ${user.name}, the Product with ID '${productId}' is removed from addToCart sucssfully. `, updatedCart });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An unexpected error occurred while placing the order.", error });
    }
});



orderProductRoute.get("/get-AllListedProduct", Authentication(["buyer"]), async (req, res) => {
    try {
        const userId = req.userID;
        const role = req.role;
        if (role !== "buyer") {
            return res.status(403).json({ message: "Access denied. Only users with the 'buyer' role can get products.", });
        }
        const buyer = await UserModel.findOne({ _id: userId, role: "buyer" });
        if (!buyer) {
            return res.status(404).json({ message: "Buyer not found. Please make sure you are logged in as a registered buyer.", });
        }
        const getAllProduct = await AddProductByFarmerModel.find();
        return res.status(201).json({ message: "All Products listed on the platform.", getAllProduct });
    } catch (error) {
        console.error("Error getting product by buyer:", error);
        return res.status(500).json({ message: "An unexpected error occurred while getting the product.", error: error.message, });
    }
});


// Place order for a  order_product endpoint
// Endpoint: /orderProduct?buyerId=buyerId&farmerId=farmerId&productId=productId
orderProductRoute.post("/orderProduct", Authentication(["buyer", "admin"]), async (req, res) => {
    try {
        const userID = req.userID;
        const role = req.role;
        const { buyerId, farmerId, productId } = req.query;

        const user = await UserModel.findById(userID);

        if (user.role !== role || (role !== "buyer" && role !== "admin")) {
            return res.status(403).json({ message: `Access denied: Only users with the 'buyer' role are allowed to place an order.` });
        }

        if (!buyerId || !farmerId || !productId) {
            return res.status(400).json({ message: "Missing required identifiers: buyerId, farmerId, or productId." });
        }

        const isProductExists = await AddProductByFarmerModel.findById(productId);
        if (!isProductExists) {
            return res.status(404).json({
                message: `Hello ${user.role.toUpperCase()} ${user.name}, the product with ID '${productId}' is no longer available on the platform.`,
            });
        }

        if (req.body.quantity > isProductExists.quantityAvailable) {
            return res.status(400).json({
                message: `Insufficient stock: Only ${isProductExists.quantityAvailable} ${isProductExists.unit} available for purchase.`,
            });
        }

        const buyProduct = await OrderProductModel.create({ buyerId, farmerId, productId, ...req.body, });

        // getting product details
        const getProductDetail = await AddProductByFarmerModel.findById(productId).lean()
        // getting farmer detail
        const getFarmerDetail = await FarmerProfileModel.findById(farmerId)
        // trying to access the farmer detail:- so that we can notify via mail to the farmer also that buyer wants to buy roduct
        const getFarmerEmail = await UserModel.findById(getFarmerDetail.userId)
        // console.log("Farmer details try to access from orderProduct endpoint line 62 code:", getFarmerEmail)
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
            to: [user.email, getFarmerEmail.email],
            subject: "✔ Your recent order confirmation.",
            html: `
            <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
                <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #4CAF50;">🌿 CropConnect Order Confirmation</h2>
                <p style="font-size: 16px;">You placed an order for <strong>${getProductDetail.name}</strong> of variety <strong>${getProductDetail.variety || "High Quality variety"}</strong>.</p>
                <p style="font-size: 15px;">📝 <strong>Description:</strong> ${getFarmerDetail.description || "Fresh from fields"}</p>
                <hr style="margin: 20px 0;" />
                <p style="font-size: 15px;"><strong>🆔 Order ID:</strong> ${buyProduct._id}</p>
                <p style="font-size: 15px;"><strong>📦 Quantity:</strong> ${buyProduct.quantity} ${buyProduct.unit}</p>
                <p style="font-size: 15px;"><strong>🏷 Price per Unit:</strong> ₹${buyProduct.pricePerUnit}/-</p>
                <p style="font-size: 15px;"><strong>💰 Total Price:</strong> ₹${buyProduct.totalPrice}/-</p>
                <p style="font-size: 15px;"><strong>💳 Payment Status:</strong> ${buyProduct.paymentStatus}</p>
                <p style="font-size: 15px;"><strong>📅 Order Date:</strong> ${buyProduct.createdAt}</p>
                <h3 style="margin-top: 30px; color: #4CAF50;">🚚 Delivery Address</h3>
                <p style="font-size: 15px;"><strong>📍 Landmark:</strong> ${buyProduct.deliveryAddress.street}</p>
                <p style="font-size: 15px;"><strong>🏙 City:</strong> ${buyProduct.deliveryAddress.city}</p>
                <p style="font-size: 15px;"><strong>🗺 State:</strong> ${buyProduct.deliveryAddress.state}</p>
                <p style="font-size: 15px;"><strong>📮 PinCode:</strong> ${buyProduct.deliveryAddress.pin}</p>
                <div style="margin-top: 30px; font-size: 15px;">
                <hr style="margin: 20px 0;" />
                <p style="font-size: 15px;">
                    We're excited to support your journey in agricultural trading. If you ever need help, don't hesitate to reach out.  
                    <br><br>
                    🌾 Thank you for choosing <strong>CropConnect</strong> — where farming meets technology!
                </p>

                <p style="margin-top: 30px; font-size: 14px; color: #888;">— Team CropConnect</p>
                </div>
                </div>

            </div>
            `
        });

        return res.status(200).json({ message: "Your order has been successfully placed and details send via mail.", buyProduct, });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An unexpected error occurred while placing the order.", error });
    }
});

// Update order for a order_product endpoint
// Endpoint: /updateProduct?orderId=_id
orderProductRoute.patch("/updateProduct", Authentication(["buyer", "admin"]), async (req, res) => {
    try {
        const userID = req.userID;
        const role = req.role;
        const { orderId } = req.query;

        if (!orderId) {
            return res.status(400).json({ message: "Missing required parameter: orderId." });
        }

        const user = await UserModel.findById(userID);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (role !== "buyer" && role !== "admin") {
            return res.status(403).json({
                message: "Access denied: Only users with 'buyer' or 'admin' roles can update an order.",
            });
        }

        const isOrderExists = await OrderProductModel.findById(orderId);
        if (!isOrderExists) {
            return res.status(404).json({
                message: `Hello ${user.role.toUpperCase()} ${user.name}, the Order with ID '${orderId}' is no longer available on the platform.`,
            });
        }

        const orderedProduct = await OrderProductModel.findOneAndUpdate({ _id: orderId }, { ...req.body }, { new: true });

        return res.status(200).json({ message: "Your order has been updated successfully.", orderedProduct, });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An unexpected error occurred while placing the order.", error });
    }
});


// delete order for a  order_product endpoint
// Endpoint: /cancelOrder?orderId=_id
orderProductRoute.delete("/cancelOrder", Authentication(["buyer", "admin"]), async (req, res) => {
    try {
        const userID = req.userID;
        const role = req.role;
        const { orderId } = req.query;

        if (!orderId) {
            return res.status(400).json({ message: "Missing required parameter: orderId." });
        }

        const user = await UserModel.findById(userID);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (role !== "buyer" && role !== "admin") {
            return res.status(403).json({
                message: "Access denied: Only users with 'buyer' or 'admin' roles can update an order.",
            });
        }

        const isOrderExists = await OrderProductModel.findById(orderId);
        if (!isOrderExists) {
            return res.status(404).json({
                message: `Hello ${user.role.toUpperCase()} ${user.name}, the Order with ID '${orderId}' is no longer available on the platform.`,
            });
        }

        const orderedProduct = await OrderProductModel.findOneAndUpdate({ _id: orderId });

        return res.status(200).json({ message: `Hello ${user.role.toUpperCase()} ${user.name}, the Order with ID '${orderId}' is cancelled sucssfully. `, orderedProduct, });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An unexpected error occurred while placing the order.", error });
    }
});


// get order for a  order_product endpoint
// Endpoint: /getOrderedProduct
orderProductRoute.get("/getOrderedProduct", Authentication(["buyer", "admin"]), async (req, res) => {
    try {
        const userID = req.userID;
        const role = req.role;

        const user = await UserModel.findById(userID);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (role !== "buyer" && role !== "admin") {
            return res.status(403).json({
                message: "Access denied: Only users with 'buyer' or 'admin' roles can update an order.",
            });
        }

        const orderedProduct = await OrderProductModel.find();
        if (orderedProduct.length == 0) {
            return res.status(200).json({
                message: `Hello ${user.role.toUpperCase()} ${user.name}, your haven't place any order.`,
            });
        }
        return res.status(200).json({ message: "Your ordered product lists.", orderedProduct, });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An unexpected error occurred while getting the ordered product list.", error });
    }
});

module.exports = { orderProductRoute };
