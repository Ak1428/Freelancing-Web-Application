import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const freelancers = await prisma.freelancerProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(freelancers);
  } catch (error) {
    console.error('Error fetching freelancers:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
