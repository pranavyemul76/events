export const adminAuth = async (req, res, next) => {
    try {
        if (!req.user || !req.user.isAdmin) {
            res.status(403).json({ message: "Admin access only" });
        }
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};
