// const pool = require("../config/db");
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// const register = async (req, res) => {
//     const { name, email, password } = req.body;

//     try {
//         const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

//         if (userExists.rows.length > 0) {
//             return res.status(400).json({ message: 'User already exists' });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         const newUser = await pool.query(
//             'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email' , [name, email, hashedPassword]
//         );

//         const token = jwt.sign(
//             { id: newUser.rows[0].id },
//                 process.env.JWT_SECRET,
//                 { expiresIn: '7d' }
//         );

//         res.status(201).json({
//             message: 'User registered successfully.',
//             token, 
//             user: newUser.rows[0]
//         });

//     } catch (err)  {
//         res.status(500).json({ message: 'Server error.', error: err.message });
//     }
// };

// const login = async (req, res) => {
//     const {email, password } = req.body;

//     try {
//         const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

//         if (user.rows.length === 0) {
//             return res.status(400).json({ message: "Invalid email or password" });
//         }

//         const isMatch = await bcrypt.compare(password, user.rows[0].password);

//         if(!isMatch) {
//             return res.status(400).json({ message: "Invalid email or password" });
//         }

//         const token = jwt.sign(
//             { id: user.rows[0].id },
//             process.env.JWT_SECRET,
//             { expiresIn: '7d' }
//         );

//         res.status(200).json({
//             message: 'Login successful.',
//             token,
//             user: {
//                 id: user.rows[0].id,
//                 name: user.rows[0].name,
//                 email: user.rows[0].email
//             }
//         });
//     }
//     catch (err)  {
//         res.status(500).json({ message: 'Server error.', error: err.message });
//     }
// };

// module.exports = { register, login };

const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const transporter = require('../config/email');
require('dotenv').config();

const register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // check if user already exists
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Email already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ generate a unique verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const newUser = await pool.query(
            `INSERT INTO users (name, email, password, is_verified, verification_token)
             VALUES ($1, $2, $3, false, $4) RETURNING *`,
            [name, email, hashedPassword, verificationToken]
        );

        // ✅ send verification email
        const verifyUrl = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${verificationToken}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify your Job Tracker account',
            html: `
                <h2>Welcome to Job Tracker, ${name}!</h2>
                <p>Please verify your email address by clicking the button below:</p>
                <a href="${verifyUrl}" 
                   style="display:inline-block;padding:12px 24px;background:#2563EB;color:white;
                          border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">
                    Verify Email
                </a>
                <p>Or copy this link: <a href="${verifyUrl}">${verifyUrl}</a></p>
                <p>This link does not expire.</p>
                <p>If you did not create this account, ignore this email.</p>
            `
        });

        res.status(201).json({
            message: 'Account created! Please check your email to verify your account before logging in.'
        });

    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

const verifyEmail = async (req, res) => {
    const { token } = req.query;
    try {
        const user = await pool.query(
            'SELECT * FROM users WHERE verification_token = $1',
            [token]
        );

        if (user.rows.length === 0) {
            return res.status(400).send(`
                <h2>Invalid or expired verification link.</h2>
                <p>Please register again.</p>
            `);
        }

        await pool.query(
            `UPDATE users SET is_verified = true, verification_token = null WHERE id = $1`,
            [user.rows[0].id]
        );

        // ✅ redirect to frontend login page after verification
        res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);

    } catch (err) {
        res.status(500).send('<h2>Server error during verification.</h2>');
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

        // ✅ block unverified users
        if (!user.rows[0].is_verified) {
            return res.status(403).json({
                message: 'Please verify your email before logging in. Check your inbox.'
            });
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

module.exports = { register, login, verifyEmail };