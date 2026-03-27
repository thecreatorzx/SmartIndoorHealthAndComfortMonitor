import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days limit
};

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "name, email and password are required" });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });
  }
  try {
    const { rows } = await db.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (rows.length > 0) {
      return res.status(409).json({ error: "User already exists" });
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
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email or Password are required" });
  }
  try {
    const { rows } = await db.query(
      "SELECT id, password_hash FROM users WHERE email = $1",
      [email],
    );
    const user = rows[0];
    const valid = user && (await bcrypt.compare(password, user.password_hash));
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
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
    return res.status(500).json({ error: "Internal server error" });
  }
});
import { authMiddleware } from "../middleware/auth.js";

router.get("/me", authMiddleware, async (req, res) => {
  const { rows } = await db.query(
    `SELECT id, name, email FROM users WHERE id = $1`,
    [req.user.userId],
  );
  if (rows.length === 0)
    return res.status(404).json({ error: "User not found" });

  return res.status(200).json(rows[0]);
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    // no maxAge here
  });
  return res.status(200).json({ message: "Logged out successfully" });
});
export default router;
