const User = require('../models/userModel');
const bcrypt = require('bcryptjs');


const userController = {
    getProfile: (req, res) => {
        const userId = req.user.id;

        User.findById(userId, (err, user) => {
            if (err || !user) return res.status(404).send('User not found');
            res.json(user);
        });
    },

    updateProfile: (req, res) => {
        const userId = req.user.id;
        const { email, username, password } = req.body;

        if (!email || !username) {
            return res.status(400).send('Email and username are required');
        }

        //verify email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).send('Invalid email format');
        }

        //verify username format
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).send('Invalid username format');
        }

        User.findByUsername(username, (err, userByUsername) => {
            if (userByUsername && userByUsername.id !== userId) {
                return res.status(400).send('Username already taken');
            }

            User.findByEmail(email, (err, userByEmail) => {
                if (userByEmail && userByEmail.id !== userId) {
                    return res.status(400).send('Email already taken');
                }

                //check if password is provided
                if (password) {
                    bcrypt.hash(password, 10, (err, hash) => {
                        if (err) return res.status(500).send('Error hashing password');

                        User.update(userId, { email, username, password: hash }, (err, user) => {
                            if (err) return res.status(500).send('Error updating user');
                            res.json(user);
                        });
                    });
                } else {
                    User.update(userId, { email, username }, (err, user) => {
                        if (err) return res.status(500).send('Error updating user');
                        res.json(user);
                    });
                }
            });
        });
    },
    getUserById: (req, res) => {
        const { userid } = req.params;

        User.findById(userid, (err, user) => {
            if (err || !user) return res.status(404).send('User not found');
            res.json(user);
        });
    }
};

module.exports = userController;
