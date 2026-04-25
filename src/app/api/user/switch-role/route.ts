import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { role } = body;

    if (role !== 'CLIENT' && role !== 'FREELANCER') {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
    }

    const userEmail = session.user.email;
    if (!userEmail) {
      return NextResponse.json({ message: 'Missing user email' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { email: userEmail },
      data: { role },
    });

    return NextResponse.json({ message: `Role updated to ${role}`, user });
  } catch (error) {
    console.error('Switch Role Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
