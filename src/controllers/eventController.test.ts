import { createEvent } from "./eventController.js";
import Event from "../models/eventModel.js";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { Response, NextFunction } from "express";

jest.mock("../models/eventModel"); // Mock the model itself

describe("Create Event Controller", () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  const mockNext = jest.fn();

  beforeEach(() => {
    mockReq = {
      body: {
        title: "Test Event",
        description: "This is a test event",
        date: "2025-05-15",
        location: "Solapur",
      },
      user: { id: "admin123", isAdmin: true },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks between tests
  });

  test("should create an event successfully for an admin user", async () => {
    const mockSave = jest.fn().mockResolvedValue({
      _id: "event123",
      title: "Test Event",
    });

    // ✅ Correctly mock Event model instance methods
    (Event as unknown as jest.Mock).mockImplementation(() => ({
      save: mockSave,
    }));

    await createEvent(
      mockReq as AuthRequest,
      mockRes as Response,
      mockNext as NextFunction
    );

    expect(mockSave).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Event created successfully",
      event: expect.objectContaining({ title: "Test Event" }),
    });
  });

  test("should return 403 if user is not an admin", async () => {
    mockReq.user = { id: "user123", isAdmin: false }; // ❌ Not an Admin

    await createEvent(
      mockReq as AuthRequest,
      mockRes as Response,
      mockNext as NextFunction
    );

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Admin access only" });
  });

  test("should handle errors properly", async () => {
    const mockSave = jest.fn().mockRejectedValue(new Error("Database error"));

    (Event as unknown as jest.Mock).mockImplementation(() => ({
      save: mockSave,
    }));

    await createEvent(
      mockReq as AuthRequest,
      mockRes as Response,
      mockNext as NextFunction
    );

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });
});
