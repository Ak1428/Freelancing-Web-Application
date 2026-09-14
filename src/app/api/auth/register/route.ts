import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Allowed roles to prevent privilege escalation
const ALLOWED_ROLES = ['CLIENT', 'FREELANCER'];

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation: minimum 8 characters
const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { name, email, password, role } = body;

    // Validate all required fields are present
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: 'Missing required fields: name, email, password, role' },
        { status: 400 }
      );
    }

    // Trim and validate inputs
    name = String(name).trim();
    email = String(email).toLowerCase().trim();
    role = String(role).toUpperCase().trim();

    // Validate name length
    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { message: 'Name must be between 2 and 100 characters' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate role - only allow CLIENT or FREELANCER, never ADMIN
    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role. Must be CLIENT or FREELANCER' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { 
          message: 'Password does not meet requirements',
          errors: passwordValidation.errors
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password with 10 rounds (standard)
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    // If freelancer, create empty profile
    if (role === 'FREELANCER') {
      await prisma.freelancerProfile.create({
        data: {
          userId: user.id,
          category: 'GENERAL',
          skills: '[]',
        }
      });
    }

    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    // Don't expose internal error details to client
    return NextResponse.json(
      { message: 'Failed to register. Please try again.' },
      { status: 500 }
    );
  }
}
