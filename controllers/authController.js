const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authController = {
    register: (req, res) => {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).send('Missing fields');
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).send('Invalid email format');
        }

        User.findByEmail(email, (err, user) => {
            if (user) {
                return res.status(400).send('User already exists');
            }

            const hashedPassword = bcrypt.hashSync(password, 10);
            User.create(username, email, hashedPassword, (err) => {
                if (err) return res.status(500).send('Database error');
                res.status(201).send('User created');
            });
        });
    },

    login: (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send('Missing fields');
        }

        User.findByEmail(email, (err, user) => {
            if (!user) {
                return res.status(400).send('User not found');
            }

            if (!bcrypt.compareSync(password, user.password)) {
                return res.status(400).send('Invalid password');
            }

            const token = jwt.sign({ id: user.id, username: user.username }, 'secret_key', { expiresIn: '1h' });
            res.json({ token });
        });
    }
};

module.exports = authController;
