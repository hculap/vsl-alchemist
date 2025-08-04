import { Router } from 'express';
import { z } from 'zod';
import { createUser, authenticateUser, generateToken } from '../lib/auth';

export const authRoutes = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// Register endpoint
authRoutes.post('/register', async (req, res) => {
  try {
    const { email, password } = RegisterSchema.parse(req.body);

    const user = await createUser(email, password);
    if (!user) {
      return res.status(400).json({ error: 'User creation failed. Email may already exist.' });
    }

    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User created successfully',
      user: { id: user.id, email: user.email },
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
authRoutes.post('/login', async (req, res) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    const user = await authenticateUser(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email },
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});