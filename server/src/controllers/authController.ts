import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/default.js';
import { validateLogin } from '../utils/validators.js';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!validateLogin(username, password)) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    if (username === config.admin.username && password === config.admin.password) {
      const token = jwt.sign({ username }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
      return res.json({ token });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

