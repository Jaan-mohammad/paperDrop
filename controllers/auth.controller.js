// 1. Imports
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ─────────────────────────────────────────
// --REGISTER--
const register = async (req, res) => {
  try {
    // Get data from request body
    const { name, email, password } = req.body;

    // Check if all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address" });
    }

    // Validate password length
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Check if email already exists
    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user to database
    const [result] = await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword],
    );

    // Send success response
    res.status(201).json({
      message: "Account created successfully",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────
// ----LOGIN----
const login = async (req, res) => {
  try {
    // 1. Get data from request body
    const { email, password } = req.body;

    // 2. Check if fields are provided
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 3. Find user by email
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = users[0];

    // 4. Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 5. Create JWT token
    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // 6. Send token back
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────
// GET ME (get logged in user info)
const getMe = async (req, res) => {
  try {
    // req.user is set by verifyToken middleware
    const [users] = await db.query(
      "SELECT user_id, name, email, role, created_at FROM users WHERE user_id = ?",
      [req.user.userId],
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user: users[0] });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Export all three functions
module.exports = { register, login, getMe };
