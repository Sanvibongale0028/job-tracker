const pool = require("../config/db");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email' , [name, email, hashedPassword]
        );

        const token = jwt.sign(
            { id: newUser.rows[0].id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully.',
            token, 
            user: newUser.rows[0]
        });

    } catch (err)  {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const login = async (req, res) => {
    const {email, password } = req.body;

    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (user.rows.length === 0) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password);

        if(!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
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
    }
    catch (err)  {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

module.exports = { register, login };