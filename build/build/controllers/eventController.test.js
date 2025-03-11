import { createEvent } from "./eventController.js";
import Event from "../models/eventModel.js";
jest.mock("../models/eventModel"); // Mock the model itself
describe("Create Event Controller", () => {
    let mockReq;
    let mockRes;
    const mockNext = jest.fn();
    beforeEach(() => {
        mockReq = {
            body: {
                title: "Test Event",
                description: "This is a test event",
                date: "2025-05-15",
                location: "Solapur",
            },
            user: { id: "admin123", isAdmin: true, role: "" },
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
        Event.mockImplementation(() => ({
            save: mockSave,
        }));
        await createEvent(mockReq, mockRes, mockNext);
        expect(mockSave).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: "Event created successfully",
            event: expect.objectContaining({ title: "Test Event" }),
        });
    });
    test("should handle errors properly", async () => {
        const mockSave = jest.fn().mockRejectedValue(new Error("Database error"));
        Event.mockImplementation(() => ({
            save: mockSave,
        }));
        await createEvent(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
});
