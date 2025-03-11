import { authMiddleware } from "./authMiddleware.js"; // Adjust path as needed
import jwt from "jsonwebtoken";
jest.mock("jsonwebtoken");
describe("Auth Middleware", () => {
    let mockReq;
    let mockRes;
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
        jwt.verify.mockReturnValue({ id: "123", isAdmin: true });
        authMiddleware(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalled();
    });
    test("should return 401 if no token is provided", () => {
        mockReq.headers = {};
        authMiddleware(mockReq, mockRes, mockNext);
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    });
    test("should return 401 if token is invalid", () => {
        jwt.verify.mockImplementation(() => {
            throw new Error("Invalid token");
        });
        authMiddleware(mockReq, mockRes, mockNext);
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ message: "Invalid token" });
    });
});
