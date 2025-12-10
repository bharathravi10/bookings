import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt';
import { loginSchema, registerSchema } from '../types';

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const validated = loginSchema.parse(req.body);
    const { email, password } = validated;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken({
      userId: String(user.id),
      email: user.email,
    });

    console.log('=== BACKEND: Login successful ===');
    console.log('User ID:', user.id);
    console.log('User Email:', user.email);
    console.log('Token generated:', token ? 'Yes (length: ' + token.length + ')' : 'No');
    console.log('Token starts with eyJ:', token.startsWith('eyJ'));

    res.json({
      token,
      user: {
        id: String(user.id),
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: error });
      return;
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const validated = registerSchema.parse(req.body);
    const { email, password, name } = validated;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const token = generateToken({
      userId: String(user.id),
      email: user.email,
    });

    res.status(201).json({
      token,
      user: {
        id: String(user.id),
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: error });
      return;
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

