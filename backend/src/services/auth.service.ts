/**
 * Authentication service — register and login.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { UserRole } from '../types/enums';
import { generateToken, AuthPayload } from '../middleware/auth';

const prisma = new PrismaClient();

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  mobile?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new Error('Email already registered.');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name,
      mobile: input.mobile,
      roles: [UserRole.APPLICANT], // Default role
    },
  });

  const payload: AuthPayload = {
    userId: user.id,
    email: user.email,
    roles: user.roles as UserRole[],
  };

  return { user: { id: user.id, email: user.email, name: user.name, roles: user.roles }, token: generateToken(payload) };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.isActive) {
    throw new Error('Invalid email or password.');
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new Error('Invalid email or password.');
  }

  const payload: AuthPayload = {
    userId: user.id,
    email: user.email,
    roles: user.roles as UserRole[],
  };

  return { user: { id: user.id, email: user.email, name: user.name, roles: user.roles }, token: generateToken(payload) };
}
