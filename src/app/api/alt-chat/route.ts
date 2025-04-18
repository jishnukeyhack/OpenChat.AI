import {NextResponse} from 'next/server';
import {altOpenChat, OpenChatInput} from '@/ai/flows/alt-initial-prompt-tuning';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {message, conversationHistory} = body as OpenChatInput;

    const response = await altOpenChat({message, conversationHistory});
    return NextResponse.json(response);
  } catch (e) {
    console.error(e);
    return NextResponse.json({error: (e as Error).message}, {status: 500});
  }
}
