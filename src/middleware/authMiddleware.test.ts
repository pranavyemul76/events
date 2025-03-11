import { Request, Response, NextFunction } from "express";
import { authMiddleware } from "./authMiddleware.js"; // Adjust path as needed
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken");

describe("Auth Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  const mockNext = jest.fn();

  beforeEach(() => {
    mockReq = {
      headers: {
        authorization: "Bearer valid_token",
      },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test("should call next() if token is valid", () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: "123", isAdmin: true });

    authMiddleware(
      mockReq as Request,
      mockRes as Response,
      mockNext as NextFunction
    );

    expect(mockNext).toHaveBeenCalled();
  });

  test("should return 401 if no token is provided", () => {
    mockReq.headers = {};

    authMiddleware(
      mockReq as Request,
      mockRes as Response,
      mockNext as NextFunction
    );

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  test("should return 401 if token is invalid", () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid token");
    });

    authMiddleware(
      mockReq as Request,
      mockRes as Response,
      mockNext as NextFunction
    );

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Invalid token" });
  });
});
