import { register, login } from "./authController.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
jest.mock("../models/userModel");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
describe("Auth Controller", () => {
    let mockReq;
    let mockRes;
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
        bcrypt.hash.mockResolvedValue("hashedPassword");
        User.prototype.save.mockResolvedValue({});
        await register(mockReq, mockRes);
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
        bcrypt.hash.mockRejectedValue(new Error("Hashing error"));
        await expect(register(mockReq, mockRes)).rejects.toThrow("Hashing error");
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
        User.findOne.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue("mockedToken");
        await login(mockReq, mockRes);
        expect(User.findOne).toHaveBeenCalledWith({ email: "john@example.com" });
        expect(bcrypt.compare).toHaveBeenCalledWith("password123", "hashedPassword");
        expect(jwt.sign).toHaveBeenCalledWith({ id: "user123", isAdmin: true }, process.env.JWT_SECRET, { expiresIn: "1d" });
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
            token: "mockedToken",
            message: "Login successful",
        });
    });
    test("should return 404 if user is not found during login", async () => {
        mockReq.body = { email: "notfound@example.com", password: "password123" };
        User.findOne.mockResolvedValue(null);
        await login(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockJson).toHaveBeenCalledWith({ message: "User not found" });
    });
    test("should return 400 if password is incorrect", async () => {
        mockReq.body = { email: "john@example.com", password: "wrongpassword" };
        const mockUser = {
            _id: "user123",
            password: "hashedPassword",
        };
        User.findOne.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(false);
        await login(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({ message: "Invalid credentials" });
    });
    test("should handle errors in login", async () => {
        mockReq.body = { email: "error@example.com", password: "password123" };
        User.findOne.mockRejectedValue(new Error("Database error"));
        await expect(login(mockReq, mockRes)).rejects.toThrow("Database error");
    });
});
