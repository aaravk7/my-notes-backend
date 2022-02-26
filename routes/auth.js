const express = require("express");
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const isLoggedIn = require('../middlewares/isLoggedIn');
const { body, validationResult } = require('express-validator');

// Secret for JWT Token
const jwtSecret = "Thisismynotesapp";

// Signup Route - Doesn't require Authentication
router.post('/signup',
    [
        // Checking if its a valid email
        body('email').isEmail().withMessage("Please enter a valid Email"),
        // Checking if password length is min 5
        body('password').isLength({ min: 5 }).withMessage("Password length must be atleast 5 characters"),
        // Checking if name length is min 2
        body('name').isLength({ min: 2 }).withMessage("Name length must be atleast 2 characters")
    ]
    , async (req, res) => {
        // Check whether there are any errors in the input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Check whether a user already exists with the entered email
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ error: "A user with this email already exists." });
        }

        try {
            // Encrypting password
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(req.body.password, salt);

            // Create a new User
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: hash
            });
            await newUser.save();

            // Signing JWT Token and giving back to User
            const token = jwt.sign({ id: newUser._id }, jwtSecret);
            res.json({ token, userName: newUser.name });
        } catch (error) {
            res.json("Internal Server Error");
        }
    });

// Login Route - Doesn't require Authentication
router.post('/login',
    [
        // Checking if its a valid email
        body('email').isEmail().withMessage("Please enter a valid Email"),
        // Checking if password length is min 5
        body('password').exists().withMessage("Please enter a valid Password"),
    ]
    , async (req, res) => {
        // Check whether there are any errors in the input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Check whether a user already exists with the entered email
        let user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ error: "Please enter valid credentials." });
        }

        // Compare Passwords
        const pass = bcrypt.compareSync(req.body.password, user.password);
        if (!pass) {
            return res.status(400).json({ error: "Please enter valid credentials." });
        }

        try {
            // Signing JWT Token and giving back to User
            const token = jwt.sign({ id: user._id }, jwtSecret);
            res.json({ token, userName: user.name });
        } catch (error) {
            res.json("Internal Server Error");
        }
    });


// Get User Details Route  - Requires Authentication
router.get('/getuser', isLoggedIn, async (req, res) => {
    try {
        let user = await User.findById(req.user).select("-password");
        res.json(user);
    } catch (error) {
        res.json("Internal Server Error");
    }
});

module.exports = router;