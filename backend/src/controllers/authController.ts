import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-development-key-only';

export const signup = async (req: Request, res: Response) => {
    const { email, password, role, name, profileData } = req.body;

    if (!email || !password || !role) {
        res.status(400).json({ error: 'Email, password, and role are required' });
        return;
    }

    try {
        // Check if user exists
        const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            res.status(400).json({ error: 'Email already exists' });
            return;
        }

        const id = uuidv4();
        const passwordHash = await bcrypt.hash(password, 10);

        await db.query(
            'INSERT INTO users (id, email, password_hash, role, name, profile_data) VALUES ($1, $2, $3, $4, $5, $6)',
            [id, email, passwordHash, role, name || null, profileData || {}]
        );

        const token = jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            token,
            user: { id, email, role, name, profileData }
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }

    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

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
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const me = async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        const result = await db.query('SELECT id, email, role, name, profile_data FROM users WHERE id = $1', [decoded.id]);
        
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
    } catch (err) {
        console.error('Me error:', err);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const token = authHeader.split(' ')[1];
    const { profileData } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        await db.query('UPDATE users SET profile_data = $1 WHERE id = $2', [profileData, decoded.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
