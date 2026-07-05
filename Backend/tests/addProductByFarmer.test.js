const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const jwt = require("jsonwebtoken");
const app = require("../server");
const { AddProductByFarmerModel } = require("../Models/addProductByFarmer.model");

let mongoServer;

const JWT_KEY = process.env.SECURED_KEY || "CropConnect_DB_B45";

const generateToken = (userId, role) => {
  return jwt.sign({ userID: userId, role }, JWT_KEY);
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.disconnect(); // disconnect from any current connection
  await mongoose.connect(uri);
}, 300000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await AddProductByFarmerModel.deleteMany({});
});

describe("Farmer Product Listing Routes", () => {
  const farmerId = new mongoose.Types.ObjectId().toString();
  const farmerToken = generateToken(farmerId, "farmer");
  const buyerToken = generateToken(new mongoose.Types.ObjectId().toString(), "buyer");

  const validProduct = {
    name: "Golden Wheat",
    variety: "Sharbati",
    description: "High-grade organic golden wheat harvested recently.",
    category: "grain",
    pricePerUnit: 40,
    unit: "kg",
    quantityAvailable: 500,
    isOrganic: true,
    harvestDate: new Date("2026-07-01").toISOString(),
    location: {
      city: "Patna",
      state: "Bihar",
      pin: "800001",
      coordinates: {
        type: "Point",
        coordinates: [85.1376, 25.5941]
      }
    }
  };

  describe("POST /addProductByFarmer/add-productByFarmer", () => {
    it("should successfully list a product for an authorized farmer", async () => {
      const response = await request(app)
        .post("/addProductByFarmer/add-productByFarmer")
        .set("Authorization", `Bearer ${farmerToken}`)
        .send(validProduct)
        .expect(201);

      expect(response.body.status).toBe(true);
      expect(response.body.status_code).toBe(201);
      expect(response.body.data.name).toBe("Golden Wheat");
      expect(response.body.data.farmerId).toBe(farmerId);
    });

    it("should reject listing if role is not farmer", async () => {
      const response = await request(app)
        .post("/addProductByFarmer/add-productByFarmer")
        .set("Authorization", `Bearer ${buyerToken}`)
        .send(validProduct)
        .expect(403);

      expect(response.body.status).toBe(false);
      expect(response.body.status_code).toBe(403);
    });

    it("should reject listing if required fields are missing", async () => {
      const invalidProduct = { ...validProduct };
      delete invalidProduct.name;
      const response = await request(app)
        .post("/addProductByFarmer/add-productByFarmer")
        .set("Authorization", `Bearer ${farmerToken}`)
        .send(invalidProduct)
        .expect(400);

      expect(response.body.status).toBe(false);
      expect(response.body.status_code).toBe(400);
      expect(response.body.message).toContain("Validation failed");
    });

    it("should reject listing with unknown fields", async () => {
      const response = await request(app)
        .post("/addProductByFarmer/add-productByFarmer")
        .set("Authorization", `Bearer ${farmerToken}`)
        .send({ ...validProduct, hackField: "malicious" })
        .expect(400);

      expect(response.body.status).toBe(false);
      expect(response.body.status_code).toBe(400);
    });

    it("should reject listing with duplicate name and harvestDate for same farmer", async () => {
      await request(app)
        .post("/addProductByFarmer/add-productByFarmer")
        .set("Authorization", `Bearer ${farmerToken}`)
        .send(validProduct)
        .expect(201);

      const response = await request(app)
        .post("/addProductByFarmer/add-productByFarmer")
        .set("Authorization", `Bearer ${farmerToken}`)
        .send(validProduct)
        .expect(409);

      expect(response.body.status).toBe(false);
      expect(response.body.status_code).toBe(409);
    });
  });

  describe("GET /addProductByFarmer/get-productByFarmer", () => {
    it("should fetch all products listed by the authenticated farmer", async () => {
      await AddProductByFarmerModel.create({ ...validProduct, farmerId });
      await AddProductByFarmerModel.create({ ...validProduct, name: "Basmati Rice", farmerId });
      // Another farmer's product
      await AddProductByFarmerModel.create({ ...validProduct, name: "Apple", farmerId: new mongoose.Types.ObjectId().toString() });

      const response = await request(app)
        .get("/addProductByFarmer/get-productByFarmer")
        .set("Authorization", `Bearer ${farmerToken}`)
        .expect(200);

      expect(response.body.status).toBe(true);
      expect(response.body.data.length).toBe(2);
    });
  });

  describe("PATCH /addProductByFarmer/update-productByFarmer/:productID", () => {
    it("should update product details successfully", async () => {
      const product = await AddProductByFarmerModel.create({ ...validProduct, farmerId });

      const response = await request(app)
        .patch(`/addProductByFarmer/update-productByFarmer/${product._id}`)
        .set("Authorization", `Bearer ${farmerToken}`)
        .send({ pricePerUnit: 45 })
        .expect(200);

      expect(response.body.status).toBe(true);
      expect(response.body.data.pricePerUnit).toBe(45);
    });

    it("should return 404 if farmer tries to update another farmer's product", async () => {
      const otherFarmerId = new mongoose.Types.ObjectId().toString();
      const product = await AddProductByFarmerModel.create({ ...validProduct, farmerId: otherFarmerId });

      const response = await request(app)
        .patch(`/addProductByFarmer/update-productByFarmer/${product._id}`)
        .set("Authorization", `Bearer ${farmerToken}`)
        .send({ pricePerUnit: 45 })
        .expect(404);

      expect(response.body.status).toBe(false);
      expect(response.body.status_code).toBe(404);
    });

    it("should reject update if invalid fields are provided", async () => {
      const product = await AddProductByFarmerModel.create({ ...validProduct, farmerId });

      const response = await request(app)
        .patch(`/addProductByFarmer/update-productByFarmer/${product._id}`)
        .set("Authorization", `Bearer ${farmerToken}`)
        .send({ pricePerUnit: -10 })
        .expect(400);

      expect(response.body.status).toBe(false);
    });
  });

  describe("DELETE /addProductByFarmer/delete-productByFarmer/:productID", () => {
    it("should delete product successfully", async () => {
      const product = await AddProductByFarmerModel.create({ ...validProduct, farmerId });

      const response = await request(app)
        .delete(`/addProductByFarmer/delete-productByFarmer/${product._id}`)
        .set("Authorization", `Bearer ${farmerToken}`)
        .expect(200);

      expect(response.body.status).toBe(true);
      const dbProduct = await AddProductByFarmerModel.findById(product._id);
      expect(dbProduct).toBeNull();
    });

    it("should return 404 if farmer tries to delete another farmer's product", async () => {
      const otherFarmerId = new mongoose.Types.ObjectId().toString();
      const product = await AddProductByFarmerModel.create({ ...validProduct, farmerId: otherFarmerId });

      const response = await request(app)
        .delete(`/addProductByFarmer/delete-productByFarmer/${product._id}`)
        .set("Authorization", `Bearer ${farmerToken}`)
        .expect(404);

      expect(response.body.status).toBe(false);
      expect(response.body.status_code).toBe(404);
    });
  });
});
