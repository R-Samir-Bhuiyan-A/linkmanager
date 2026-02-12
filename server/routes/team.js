const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find().sort({ joinedAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST invite user
router.post('/invite', async (req, res) => {
    try {
        const { name, email, role } = req.body;

        // Check if user already exists
        const existinguser = await User.findOne({ email });
        if (existinguser) return res.status(400).json({ message: 'User already exists' });

        const newUser = new User({
            name,
            email,
            role,
            status: 'Invited'
        });

        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE user
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await user.deleteOne();
        res.json({ message: 'User removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
