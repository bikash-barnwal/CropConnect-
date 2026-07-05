const request = require("supertest");
const app = require("../server");

describe("GET /test", () => {
  it("returns a success message", async () => {
    const response = await request(app)
      .get("/test")
      .expect(200);

    expect(response.body).toEqual({ message: "This is test endpoint." });
  });
});
