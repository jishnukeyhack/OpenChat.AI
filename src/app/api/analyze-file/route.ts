import {NextResponse} from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const message = formData.get('message') as string; // Get the message

    if (!file) {
      return NextResponse.json({error: 'No file uploaded'}, {status: 400});
    }

    // Basic file type validation
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({error: 'Unsupported file type'}, {status: 400});
    }

    // You can add file size validation here

    // Read file content based on type
    let fileContent: string | null = null;
    let analysisResult;

    if (file.type.startsWith('image/')) {
      // For images, use the analyzeImage flow
      const imageUrl = URL.createObjectURL(file);
      analysisResult = await analyzeImage({
        imageUrl: imageUrl,
      });

    } else if (file.type === 'application/pdf') {
      fileContent = `Uploaded PDF document of type ${file.type}`;
      // Call OpenChat flow to analyze the file, including the user's message.
      analysisResult = await openChat({
        message: `Analyze this ${file.type} file: ${fileContent}. User message: ${message}`,
        conversationHistory: '', // Pass conversation history if needed
      });
    } else if (file.type === 'text/plain') {
      // Read the file as text
      fileContent = await file.text();
      analysisResult = await openChat({
        message: `Analyze this ${file.type} file: ${fileContent}. User message: ${message}`,
        conversationHistory: '', // Pass conversation history if needed
      });
    } else {
      fileContent = 'Uploaded file of unknown type';
      analysisResult = await openChat({
        message: `Analyze this file of unknown type: ${fileContent}. User message: ${message}`,
        conversationHistory: '', // Pass conversation history if needed
      });
    }

    return NextResponse.json({analysis: analysisResult.analysis});
  } catch (e) {
    console.error(e);
    return NextResponse.json({error: (e as Error).message}, {status: 500});
  }
}

// Import the OpenChat function
import {openChat} from '@/ai/flows/initial-prompt-tuning';
import {analyzeImage} from '@/ai/flows/analyze-file-flow';
