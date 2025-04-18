import {NextResponse} from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const message = formData.get('message') as string;

    if (!file) {
      return NextResponse.json({error: 'No file uploaded'}, {status: 400});
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({error: 'Unsupported file type'}, {status: 400});
    }

    let fileContent: string | null = null;
    let analysisResult;

    if (file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      analysisResult = await analyzeFile({
        fileUrl: imageUrl,
        fileType: file.type,
      });

    } else if (file.type === 'application/pdf') {
      fileContent = `Uploaded PDF document of type ${file.type}`;
      analysisResult = await analyzeFile({
        fileUrl: URL.createObjectURL(file),
        fileType: file.type,
      });
    } else if (file.type === 'text/plain') {
      fileContent = await file.text();
      analysisResult = await analyzeFile({
        fileUrl: URL.createObjectURL(file),
        fileType: file.type,
      });
    } else {
      fileContent = 'Uploaded file of unknown type';
      analysisResult = await analyzeFile({
        fileUrl: URL.createObjectURL(file),
        fileType: 'unknown',
      });
    }

    return NextResponse.json({analysis: analysisResult.analysis});
  } catch (e) {
    console.error(e);
    return NextResponse.json({error: (e as Error).message}, {status: 500});
  }
}

import { analyzeFile } from '@/ai/flows/analyze-file-flow';
