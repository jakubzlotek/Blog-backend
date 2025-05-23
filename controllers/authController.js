const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const util = require("util");
const User = require("../models/userModel");

// "Promisify" callback-based methods so we can await them
const findByEmail = util.promisify(User.findByEmail);
const findByUsername = util.promisify(User.findByUsername); // nowa metoda
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
      // czekamy aż INSERT w bazie się zakończy
      await createUser(username, email, hashedPassword);

      // dopiero po udanym zapisie odsyłamy odpowiedź
      return res.status(201).json({ success: true, message: "User created" });
    } catch (err) {
      console.error("Registration error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
  },

  login: async (req, res) => {
    const { identifier, password } = req.body;
    try {
      // wybieramy metodę wyszukiwania:
      let user;
      if (identifier.includes('@')) {
        user = await findByEmail(identifier);
      } else {
        user = await findByUsername(identifier);
      }
      if (!user) {
        return res.status(400).json({ success: false, message: 'Nie znaleziono użytkownika' });
      }
      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(400).json({ success: false, message: 'Nieprawidłowe hasło' });
      }
      const token = jwt.sign(
        { id: user.id, username: user.username },
        'secret_key',
        { expiresIn: '1h' }
      );
      // Remove password from user object before sending
      const { password: _pw, ...userSafe } = user;
      return res.json({ success: true, token, user: userSafe });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ success: false, message: 'Błąd wewnętrzny serwera' });
    }
  }
};

module.exports = authController;
