import { register, login } from "./authController.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

jest.mock("../models/userModel");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("Auth Controller", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  const mockJson = jest.fn();
  const mockStatus = jest.fn().mockImplementation(() => ({ json: mockJson }));

  beforeEach(() => {
    mockReq = { body: {} };
    mockRes = {
      status: mockStatus,
      json: mockJson,
    };
    jest.clearAllMocks();
  });

  // ========== REGISTER ==========
  test("should register a new user successfully", async () => {
    mockReq.body = {
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      isAdmin: true,
    };

    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
    (User.prototype.save as jest.Mock).mockResolvedValue({});

    await register(mockReq as Request, mockRes as Response);

    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    expect(User.prototype.save).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockJson).toHaveBeenCalledWith({
      message: "User registered successfully",
    });
  });

  test("should handle error during registration", async () => {
    mockReq.body = {
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      isAdmin: true,
    };

    (bcrypt.hash as jest.Mock).mockRejectedValue(new Error("Hashing error"));

    await expect(
      register(mockReq as Request, mockRes as Response)
    ).rejects.toThrow("Hashing error");
  });

  // ========== LOGIN ==========
  test("should log in successfully and return a token", async () => {
    mockReq.body = {
      email: "john@example.com",
      password: "password123",
    };

    const mockUser = {
      _id: "user123",
      email: "john@example.com",
      password: "hashedPassword",
      isAdmin: true,
    };

    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("mockedToken");

    await login(mockReq as Request, mockRes as Response);

    expect(User.findOne).toHaveBeenCalledWith({ email: "john@example.com" });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "password123",
      "hashedPassword"
    );
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: "user123", isAdmin: true },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      token: "mockedToken",
      message: "Login successful",
    });
  });

  test("should return 404 if user is not found during login", async () => {
    mockReq.body = { email: "notfound@example.com", password: "password123" };
    (User.findOne as jest.Mock).mockResolvedValue(null);

    await login(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({ message: "User not found" });
  });

  test("should return 400 if password is incorrect", async () => {
    mockReq.body = { email: "john@example.com", password: "wrongpassword" };

    const mockUser = {
      _id: "user123",
      password: "hashedPassword",
    };

    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await login(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({ message: "Invalid credentials" });
  });

  test("should handle errors in login", async () => {
    mockReq.body = { email: "error@example.com", password: "password123" };
    (User.findOne as jest.Mock).mockRejectedValue(new Error("Database error"));

    await expect(
      login(mockReq as Request, mockRes as Response)
    ).rejects.toThrow("Database error");
  });
});
