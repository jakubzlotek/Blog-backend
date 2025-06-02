const User = require('../models/userModel');
const bcrypt = require('bcryptjs');


const userController = {
    getProfile: (req, res) => {
        const userId = req.user.id;

        User.findById(userId, (err, user) => {
            if (err || !user) return res.status(404).json({ success: false, message: 'User not found' });
            res.json({ success: true, user });
        });
    },

    updateProfile: (req, res) => {
        const userId = req.user.id;
        const { email, username, password } = req.body;

        if (!email || !username) {
            return res.status(401).json({ success: false, message: 'Email and username are required' });
        }

        //verify email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        if (username.trim() === '') {
            return res.status(400).json({ success: false, message: 'Username cannot be empty' });
        }

        User.findByUsername(username, (err, userByUsername) => {
            if (userByUsername && userByUsername.id !== userId) {
                return res.status(400).json({ success: false, message: 'Username already taken' });
            }

            User.findByEmail(email, (err, userByEmail) => {
                if (userByEmail && userByEmail.id !== userId) {
                    return res.status(400).json({ success: false, message: 'Email already taken' });
                }

                //check if password is provided
                if (password) {
                    bcrypt.hash(password, 10, (err, hash) => {
                        if (err) return res.status(500).json({ success: false, message: 'Error hashing password' });

                        User.updateWithPassword
                            ? User.updateWithPassword(userId, username, email, hash, (err) => {
                                if (err) return res.status(500).json({ success: false, message: 'Error updating user' });
                                User.findById(userId, (err, updatedUser) => {
                                    if (err) return res.status(500).json({ success: false, message: 'Error fetching user' });
                                    res.json({ success: true, user: updatedUser });
                                });
                            })
                            : res.status(500).json({ success: false, message: 'Password update not supported' });
                    });
                } else {
                    User.update(userId, username, email, (err) => {
                        if (err) return res.status(500).json({ success: false, message: 'Error updating user' });
                        User.findById(userId, (err, updatedUser) => {
                            if (err) return res.status(500).json({ success: false, message: 'Error fetching user' });
                            res.json({ success: true, user: updatedUser });
                        });
                    });
                }
            });
        });
    },
    getUserById: (req, res) => {
        const { userid } = req.params;

        User.findById(userid, (err, user) => {
            if (err || !user) return res.status(404).json({ success: false, message: 'User not found' });
            res.json({ success: true, user });
        });
    },
    uploadAvatar: (req, res) => {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
        const avatarUrl = `/uploads/${req.file.filename}`;
        const userId = req.user.id;
        User.findById(userId, (err, user) => {
            if (err || !user) return res.status(404).json({ success: false, message: 'User not found' });
            User.update(
                userId,
                { username: user.username, email: user.email, avatar_url: avatarUrl },
                (err, updatedUser) => {
                    if (err) return res.status(500).json({ success: false, message: 'Error updating avatar' });
                    res.json({ success: true, avatar_url: avatarUrl });
                }
            );
        });
    }
};

module.exports = userController;
