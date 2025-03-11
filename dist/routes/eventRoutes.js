import express from "express";
import { createEvent, getAllEvents } from "../controllers/eventController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminAuth } from "../middleware/adminAuth.js";
const router = express.Router();
router.post("/post", authMiddleware, adminAuth, createEvent);
router.get("/get", getAllEvents);
export default router;
