import { adminAuth } from "./adminAuth.js";
describe("Admin Auth Middleware", () => {
    let mockReq;
    let mockRes;
    let mockNext;
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockImplementation(() => ({ json: mockJson }));
    beforeEach(() => {
        mockReq = {};
        mockRes = {
            status: mockStatus,
            json: mockJson,
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });
    // ========== SUCCESS CASE ==========
    test("should call next() if user is admin", async () => {
        mockReq.user = { id: "user123", isAdmin: true };
        await adminAuth(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockJson).not.toHaveBeenCalled();
    });
    // ========== FAILURE CASES ==========
    test("should return 403 if user is not an admin", async () => {
        mockReq.user = { id: "user123", isAdmin: false };
        await adminAuth(mockReq, mockRes, mockNext);
        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockJson).toHaveBeenCalledWith({ message: "Admin access only" });
        expect(mockNext).not.toHaveBeenCalled();
    });
    test("should return 403 if req.user is undefined", async () => {
        mockReq.user = undefined;
        await adminAuth(mockReq, mockRes, mockNext);
        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockJson).toHaveBeenCalledWith({ message: "Admin access only" });
        expect(mockNext).not.toHaveBeenCalled();
    });
    test("should return 401 if an error occurs", async () => {
        jest.spyOn(mockRes, "status").mockImplementation(() => {
            throw new Error("Token error");
        });
        await expect(adminAuth(mockReq, mockRes, mockNext)).rejects.toThrow("Token error");
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith({ message: "Invalid token" });
        expect(mockNext).not.toHaveBeenCalled();
    });
});
