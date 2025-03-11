import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import cors from "cors";

import path from "path";
dotenv.config();

const app = express();
const port = Number(process.env.PORT);
const host = process.env.VERCEL_URL?.toString() || "";
connectDB();
app.use(
  cors({
    origin: "*", // Specify the allowed origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  })
);
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "build")));
  app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });
}

app.listen(port, host, () => console.log(`Server running on port ${port}`));
