const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authController = {

    register: (req, res) => {
        const { username, email, password } = req.body;


        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: 'Missing fields' });
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        User.findByEmail(email, (err, user) => {
            if (user) {
                return res.status(400).json({ success: false, message: 'User already exists' });
            }

            // Check for duplicate username
            User.findByUsername(username, (err, userByUsername) => {
                if (userByUsername) {
                    return res.status(400).json({ success: false, message: 'Username already taken' });
                }

                const hashedPassword = bcrypt.hashSync(password, 10);
                User.create(username, email, hashedPassword, (err) => {
                    if (err) return res.status(500).json({ success: false, message: 'Database error' });
                    res.status(201).json({ success: true, message: 'User created' });
                });
            });
        });
    },

    login: (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Missing fields' });
        }

        User.findByEmail(email, (err, user) => {
            if (!user) {
                return res.status(400).json({ success: false, message: 'User not found' });
            }

            if (!bcrypt.compareSync(password, user.password)) {
                return res.status(400).json({ success: false, message: 'Invalid password' });
            }

            const token = jwt.sign({ id: user.id, username: user.username }, 'secret_key', { expiresIn: '1h' });
            res.json({ success: true, token });
        });
    }
};

module.exports = authController;
