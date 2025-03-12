import { Request, Response, NextFunction } from "express";
import Event from "../models/eventModel.js"; // Assuming you have an Event model
import { AuthRequest } from "../middleware/authMiddleware.js"; // Import the extended Request type

export const createEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log(req);
  try {
    const { title, description, date, location } = req.body;

    if (!req.user || !req.user.isAdmin) {
      res.status(403).json({ message: "Admin access only" });
      return;
    }

    const newEvent = new Event({
      title,
      description,
      date,
      location,
      organizer: req.user.id,
    });

    await newEvent.save();
    res
      .status(201)
      .json({ message: "Event created successfully", event: newEvent });
  } catch (error) {
    next(error);
  }
};

export const getAllEvents = async (req: Request, res: Response) => {
  const events = await Event.find().populate("organizer", "name").exec();
  res.status(200).json(events);
};
