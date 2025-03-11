import Event from "../models/eventModel.js"; // Assuming you have an Event model
export const createEvent = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
export const getAllEvents = async (req, res) => {
    const events = await Event.find();
    res.status(200).json(events);
};
