const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const util = require("util");
const User = require("../models/userModel");
const JWT_SECRET = process.env.JWT_SECRET || "secret_key";


// "Promisify" callback-based methods so we can await them
const findByEmail = util.promisify(User.findByEmail);
const findByUsername = util.promisify(User.findByUsername);
const createUser = util.promisify(User.create);

const authController = {
  register: async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    try {
      const existing = await findByEmail(email);
      if (existing) {
        return res.status(400).json({ success: false, message: "User already exists" });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      await createUser(username, email, hashedPassword);
      return res.status(201).json({ success: true, message: "User created" });
    } catch (err) {
      console.error("Registration error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
  },

  login: async (req, res) => {
    const { identifier, password } = req.body;
    try {
      let userRecord;
      if (identifier.includes("@")) {
        userRecord = await findByEmail(identifier);
      } else {
        userRecord = await findByUsername(identifier);
      }
      if (!userRecord) {
        return res.status(400).json({ success: false, message: 'Nie znaleziono użytkownika' });
      }
      if (!bcrypt.compareSync(password, userRecord.password)) {
        return res.status(400).json({ success: false, message: "Nieprawidłowe hasło" });
      }

      // Generujemy token
      const token = jwt.sign(
        { id: userRecord.id, username: userRecord.username },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Zwracamy token oraz obiekt usera z id, username i email
      return res.json({
        token,
        user: {
          id: userRecord.id,
          username: userRecord.username,
          email: userRecord.email
        }
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ message: "Błąd wewnętrzny serwera" });
    }
  },

  refreshToken: (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ success: false, message: 'Forbidden' });

      // Remove iat and exp from user payload if present
      const { iat, exp, ...payload } = user;

      // Issue a new token
      const newToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token: newToken });
    });
  },
};

module.exports = authController;