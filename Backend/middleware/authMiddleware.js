import jwt from 'jsonwebtoken'
import User from "../models/User.js";
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'No token provided' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_only')
    req.admin = decoded
    next()
  } catch {
    return res.status(403).json({ message: 'Invalid or expired token' })
  }
}
export const verifyOrganizerToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret_only");
    if (decoded.role !== "organizer") return res.status(403).json({ message: "Organizer only" });

    const org = await User.findById(decoded.id);
    if (!org || !org.isActive) return res.status(401).json({ message: "Organizer not found / inactive" });

    req.organizer = org;
    next();
  } catch {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
  };