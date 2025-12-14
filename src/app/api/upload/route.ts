import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';
import * as pdfParse from 'pdf-parse';

const prisma = new PrismaClient();


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    let conversationId = formData.get('conversationId') as string | null;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Create conversation if needed
    if (!conversationId) {
      const conversation = await prisma.conversation.create({
        data: {
          title: files[0].name.replace('.pdf', ''),
        },
      });
      conversationId = conversation.id;
    }

    const uploadedFiles = [];

    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const fileName = `${Date.now()}-${file.name}`;
      const uploadDir = join(process.cwd(), 'public/uploads');

      // Create uploads directory if it doesn't exist
      await mkdir(uploadDir, { recursive: true });

      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, Buffer.from(buffer));

      // Extract text from PDF
      let extractedText = '';
      try {
        const pdfData = await pdfParse(Buffer.from(buffer));
        extractedText = pdfData.text;
      } catch (err) {
        console.warn('PDF text extraction failed:', err);
      }

      // Save to database
      const savedFile = await prisma.file.create({
        data: {
          conversationId,
          originalName: file.name,
          storagePath: `/uploads/${fileName}`,
          mimeType: file.type,
          size: file.size,
          extractedText: extractedText.substring(0, 50000), // Limit to 50k chars
        },
      });

      uploadedFiles.push({
        id: savedFile.id,
        originalName: savedFile.originalName,
        size: savedFile.size,
      });
    }

    return NextResponse.json({
      success: true,
      conversationId,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: String(error) },
      { status: 500 }
    );
  }
}
