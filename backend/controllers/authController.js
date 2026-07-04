const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const validateEmail = async (email) => {
    const apiKey = process.env.ABSTRACT_API_KEY;
    const response = await fetch(
        `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${email}`
    );
    const data = await response.json();
    if (
        data.deliverability !== 'DELIVERABLE' ||
        data.is_valid_format?.value === false
    ) {
        return false;
    }
    return true;
};

const register = async (req, res) => {
    const { name, email, password } = req.body;
    try {

        // safer validation — if API is down, allow registration to proceed
        let isValidEmail = true;
        try {
            isValidEmail = await validateEmail(email);
        } catch (validationErr) {
            console.error('Email validation API failed:', validationErr.message);
        }

        if (!isValidEmail) {
            return res.status(400).json({
                message: 'This email address does not exist or cannot receive emails, Please use a valid email address.'
            });
        }

        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Email already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
            [name, email, hashedPassword]
        );

        const token = jwt.sign(
            { id: newUser.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully.',
            token,
            user: {
                id: newUser.rows[0].id,
                name: newUser.rows[0].name,
                email: newUser.rows[0].email
            }
        });

    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { id: user.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Login successful.',
            token,
            user: {
                id: user.rows[0].id,
                name: user.rows[0].name,
                email: user.rows[0].email
            }
        });

    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

module.exports = { register, login };