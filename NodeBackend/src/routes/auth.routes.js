import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate, registerSchema, loginSchema } from "../utils/validate.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not set in environment");
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "None",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: "Too many attempts, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  async (req, res, next) => {
    const { name, email, password } = req.body;
    try {
      const { rows } = await db.query("SELECT id FROM users WHERE email = $1", [
        email,
      ]);
      if (rows.length > 0) {
        const err = new Error("User already exists");
        err.status = 409;
        return next(err);
      }
      const password_hash = await bcrypt.hash(password, 10);

      const { rows: newUser } = await db.query(
        "INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING id",
        [name, email, password_hash],
      );

      const token = jwt.sign({ userId: newUser[0].id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.cookie("token", token, COOKIE_OPTIONS);

      return res.status(201).json({
        message: "User registered successfully",
        id: newUser[0].id,
        name,
        email,
      });
    } catch (err) {
      console.error(err.message);
      return next(err);
    }
  },
);

router.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  async (req, res, next) => {
    const { email, password } = req.body;
    try {
      const { rows } = await db.query(
        "SELECT id, name, password_hash FROM users WHERE email = $1",
        [email],
      );
      const user = rows[0];
      const valid =
        user && (await bcrypt.compare(password, user.password_hash));
      if (!valid) {
        const err = new Error("Invalid email or password");
        err.status = 401;
        return next(err);
      }
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.cookie("token", token, COOKIE_OPTIONS);
      return res.status(200).json({
        id: user.id,
        name: user.name,
        email,
        message: "Logged in successfully",
      });
    } catch (err) {
      console.error(err.message);
      return next(err);
    }
  },
);

router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT id, name, email FROM users WHERE id = $1`,
      [req.user.userId],
    );
    if (rows.length === 0) {
      const err = new Error("User not found");
      err.status = 404;
      return next(err);
    }
    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    return next(err);
  }
});

router.post("/logout", (req, res, next) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
  });
  return res.status(200).json({ message: "Logged out successfully" });
});
export default router;
