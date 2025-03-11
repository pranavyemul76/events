import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
export const register = async (req, res) => {
    const { name, email, password, isAdmin, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            password: hashedPassword,
            isAdmin,
            role,
        });
        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            res.status(404).json({ message: "User not found" });
        }
        else {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch)
                res.status(400).json({ message: "Invalid credentials" });
            const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
            res.status(200).json({ token, message: "Login successful" });
        }
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
};
