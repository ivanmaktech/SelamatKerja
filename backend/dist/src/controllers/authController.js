"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.me = exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db"));
const uuid_1 = require("uuid");
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-development-key-only';
const signup = async (req, res) => {
    const { email, password, role, name, profileData } = req.body;
    if (!email || !password || !role) {
        res.status(400).json({ error: 'Email, password, and role are required' });
        return;
    }
    try {
        // Check if user exists
        const existingUser = await db_1.default.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            res.status(400).json({ error: 'Email already exists' });
            return;
        }
        const id = (0, uuid_1.v4)();
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        await db_1.default.query('INSERT INTO users (id, email, password_hash, role, name, profile_data) VALUES ($1, $2, $3, $4, $5, $6)', [id, email, passwordHash, role, name || null, profileData || {}]);
        const token = jsonwebtoken_1.default.sign({ id, email, role }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            token,
            user: { id, email, role, name, profileData }
        });
    }
    catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }
    try {
        const result = await db_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isValidPassword) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
                profileData: user.profile_data
            }
        });
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.login = login;
const me = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const result = await db_1.default.query('SELECT id, email, role, name, profile_data FROM users WHERE id = $1', [decoded.id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const user = result.rows[0];
        res.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
                profileData: user.profile_data
            }
        });
    }
    catch (err) {
        console.error('Me error:', err);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};
exports.me = me;
const updateProfile = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const token = authHeader.split(' ')[1];
    const { profileData } = req.body;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        await db_1.default.query('UPDATE users SET profile_data = $1 WHERE id = $2', [profileData, decoded.id]);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
exports.updateProfile = updateProfile;
