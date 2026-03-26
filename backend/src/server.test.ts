import request from "supertest";
import app from "./server";

describe("Server Health Check", () => {
  it("should return 200 and status ok for /health endpoint", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      message: "Weather Map Backend API is running",
    });
  });
});
