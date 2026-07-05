const express = require("express");
// const path = require("path");
// const multer = require("multer");
// const fs = require("fs");
// const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
dotenv.config();

const app = express();
require("dotenv").config();
const cors = require("cors")

const PORT = process.env.PORT || 3000;

// calling ConnectToDB fuction database
const { ConnectToDB } = require("./Config/db");

const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 75, // Limit each IP to 75 requests per windowMs
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

// const path = require('path');
// const morgan = require('morgan')

// const accessLogStream = fs.createWriteStream(
//   path.join(__dirname, 'Logs', 'server.log'),
//   { flags: 'a' } // append mode
// );

// app.use(morgan('combined', { stream: accessLogStream }));


// different endpoint routes
const { profileImgRoute } = require("./Routes/profileImg.routes");
const { userRoute } = require("./Routes/user.routes");
const { farmerProfileRouter } = require("./Routes/farmerProfile.routes");
const { buyerProfileRoute } = require("./Routes/buyerProfile.routes");
const { orderProductRoute } = require("./Routes/orderProduct.routes");
const { addProductByFarmerRoute } = require("./Routes/addProductByFarmer.routes");

// Middlewares -> JSON to parse data
app.use(express.json());
app.use(cors({
  origin: [
    "https://crop-connect-zeta.vercel.app",
    "http://localhost:5173"
  ],
  credentials: true
}))

app.use(limiter)

app.get("/test", (req, res) => {
  res.json({ message: "This is test endpoint." });
});

// user router
app.use("/user", userRoute);

// Login user create profile: farmerProfile, role_login:farmer
app.use("/farmerProfile", farmerProfileRouter);

// Login user create profile: buyerProfile, role_login:buyer
app.use("/buyerProfile", buyerProfileRoute);

// add new product by farmer for available to sell
app.use("/addProductByFarmer", addProductByFarmerRoute);

// place order of product/crop by buyer's only
app.use("/orderProduct", orderProductRoute);

// set profile Img of user using cloudinary
app.use("/setProfileImg", profileImgRoute);

if (require.main === module) {
  app.listen(PORT, () => {
    ConnectToDB();
    console.log("Server Started:", PORT);
  });
}

module.exports = app;
