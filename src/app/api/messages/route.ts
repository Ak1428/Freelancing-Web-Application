import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { receiverId: userId },
          { senderId: userId }
        ]
      },
      include: {
        sender: { select: { name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { receiverId, content, jobId } = await req.json();

    // Validate receiverId
    if (!receiverId || typeof receiverId !== 'string') {
      return NextResponse.json(
        { message: 'Invalid receiver ID' },
        { status: 400 }
      );
    }

    // Prevent sending message to self
    if (receiverId === (session.user as any).id) {
      return NextResponse.json(
        { message: 'Cannot send message to yourself' },
        { status: 400 }
      );
    }

    // Validate and sanitize content
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { message: 'Message content is required' },
        { status: 400 }
      );
    }

    const sanitizedContent = String(content)
      .trim()
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .substring(0, 5000); // Max length 5000 chars

    if (sanitizedContent.length < 1) {
      return NextResponse.json(
        { message: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true }
    });

    if (!receiver) {
      return NextResponse.json(
        { message: 'Receiver not found' },
        { status: 404 }
      );
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId: (session.user as any).id,
        receiverId,
        jobId: jobId ? String(jobId) : null,
        content: sanitizedContent
      },
      include: {
        sender: { select: { name: true, role: true } },
        receiver: { select: { name: true } }
      }
    });

    return NextResponse.json(
      { message: 'Message sent successfully', data: message },
      { status: 201 }
    );
  } catch (error) {
    console.error('Message creation error:', error);
    return NextResponse.json(
      { message: 'Failed to send message' },
      { status: 500 }
    );
  }
}
