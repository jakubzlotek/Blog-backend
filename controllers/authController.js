const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const util = require("util");
const User = require("../models/userModel");

// "Promisify" callback-based methods so we can await them
const findByEmail = util.promisify(User.findByEmail);
const findByUsername = util.promisify(User.findByUsername);
const createUser = util.promisify(User.create);

const authController = {
  register: async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    try {
      const existing = await findByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      await createUser(username, email, hashedPassword);
      return res.status(201).json({ message: "User created" });
    } catch (err) {
      console.error("Registration error:", err);
      return res.status(500).json({ message: "Database error" });
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
        return res.status(400).json({ message: "Nie znaleziono użytkownika" });
      }
      if (!bcrypt.compareSync(password, userRecord.password)) {
        return res.status(400).json({ message: "Nieprawidłowe hasło" });
      }

      // Generujemy token
      const token = jwt.sign(
        { id: userRecord.id, username: userRecord.username },
        "secret_key",
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
};

module.exports = authController;