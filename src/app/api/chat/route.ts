import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import { FEE_SYSTEM_PROMPT, buildFeeContext } from '@/lib/feePrompt';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, message, fileIds } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // Create conversation if needed
    let convId = conversationId;
    if (!convId) {
      const newConv = await prisma.conversation.create({
        data: {
          title: message.substring(0, 50),
        },
      });
      convId = newConv.id;
    }

    // Save user message to database
    const userMsg = await prisma.message.create({
      data: {
        conversationId: convId,
        role: 'user',
        content: message,
      },
    });

    // Link user message to files
    if (fileIds && fileIds.length > 0) {
      for (const fileId of fileIds) {
        try {
          await prisma.messageFile.create({
            data: {
              messageId: userMsg.id,
              fileId,
            },
          });
        } catch (err) {
          console.warn('Could not link file:', err);
        }
      }
    }

    // Fetch previous messages and file content
    const previousMessages = await prisma.message.findMany({
      where: { conversationId: convId },
      orderBy: { createdAt: 'asc' },
      take: -10, // Last 10 messages for context
    });

    const files = await prisma.file.findMany({
      where: { id: { in: fileIds || [] } },
    });

    const extractedTexts = files
      .map((f) => f.extractedText || '')
      .filter((t) => t.length > 0);

    const context = buildFeeContext(previousMessages, extractedTexts);

    // Call OpenAI API with Fee persona
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      system: FEE_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `${context}\n\nUser question: ${message}`,
        },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const assistantContent =
      response.choices[0]?.message?.content || 'I could not generate a response.';

    // Save assistant message to database
    const assistantMsg = await prisma.message.create({
      data: {
        conversationId: convId,
        role: 'assistant',
        content: assistantContent,
      },
    });

    // Link assistant message to files for context
    if (fileIds && fileIds.length > 0) {
      for (const fileId of fileIds) {
        try {
          await prisma.messageFile.create({
            data: {
              messageId: assistantMsg.id,
              fileId,
            },
          });
        } catch (err) {
          console.warn('Could not link file:', err);
        }
      }
    }

    return NextResponse.json({
      conversationId: convId,
      reply: assistantContent,
      messageId: assistantMsg.id,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Chat failed', details: String(error) },
      { status: 500 }
    );
  }
}
