import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: { id: string; isAdmin: boolean };
}

export const adminAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.isAdmin) {
      res.status(403).json({ message: "Admin access only" });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
