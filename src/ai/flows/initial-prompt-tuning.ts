'use server';

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const OpenChatInputSchema = z.object({
  message: z.string().describe('The user message to be processed.'),
  conversationHistory: z.string().optional().describe('The history of the conversation thus far.'),
});
export type OpenChatInput = z.infer<typeof OpenChatInputSchema>;

const OpenChatOutputSchema = z.object({
  response: z.string().describe('The AI generated response.'),
});
export type OpenChatOutput = z.infer<typeof OpenChatOutputSchema>;

export async function openChat(input: OpenChatInput): Promise<OpenChatOutput> {
  return openChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'openChatPrompt',
  input: {
    schema: z.object({
      message: z.string().describe('The user message to be processed.'),
      conversationHistory: z.string().optional().describe('The history of the conversation thus far.'),
      isGreeting: z.boolean().optional().describe('Whether the user message is a greeting.'),
      creatorInquiry: z.boolean().optional().describe('Whether the user is asking about the creator.'),
      isHinglish: z.boolean().optional().describe('Whether the user is using Hinglish.'),
    }),
  },
  output: {
    schema: z.object({
      response: z.string().describe('The AI generated response.'),
    }),
  },
  prompt: `You are OpenChat, an AI assistant designed to provide helpful and informative responses. Focus on conciseness and relevance.

{{#if isGreeting}}
Hi there! OpenChat Here 👋 How can I assist you today? I'm ready to answer your questions, provide information, or help in any way I can. Just let me know what you need! 😊🎉
{{else}}
  {{#if isHinglish}}
    Kya haal hai dost! OpenChat is here. Bol kya help chahiye tujhe? 🎉😎
  {{else}}
    Hi there! OpenChat Here 👋 How can I assist you today? I'm ready to answer your questions, provide information, or help in any way I can. Just let me know what you need! 🎉😊
  {{/if}}
{{/if}}

{{#if conversationHistory}}
Conversation History:
{{{conversationHistory}}}
{{/if}}

{{#if creatorInquiry}}
Created by Jishnu Chauhan, an enthusiastic AI engineer from Dr. Akhilesh Das Gupta Institute of Professional Studies, currently in 1st year B.Tech AIML (Sec K). 🤔💡✅🚀🌟
{{/if}}

User: {{{message}}}

AI: Okay, let's think step by step. Your response should be natural, engaging, and sound like a human. Give key points line by line, like ChatGPT answers. Use Markdown formatting to structure your response with headings, bullet points, and code blocks where appropriate. Provide a well-reasoned and detailed response to the user's request. Format the response with clear paragraphs, bullet points where appropriate, and use conversational language. Make sure every sentence should have a proper and clear meaning. Also include friendly emojis in your response! 😊🎉🤔💡✅🚀🌟

If the user's question asks about live information, such as live news, trending topics, or live scores, make sure to give the current information from the web by performing a search. Be elaborate and descriptive and provide links in blue color.
If the user replies or asks in any other language respond in same language.
If the user ask about any url or link provide it in blue colour.

If the user asks 'tumhara baap kon hai' or any similar questions about your origin, respond with the details of Jishnu Chauhan in Hinglish.
If the user asks 'who created you' or any similar questions about your origin, respond with details about Jishnu Chauhan. Refrain from answering in code formats, unless explicitly asked.

Yaar, if the user is speaking in Hinglish, respond in Hinglish with a bit of bro-code. 😎 Bol, kya help chahiye tujhe? 🤔
`,
});

const openChatFlow = ai.defineFlow<
  typeof OpenChatInputSchema,
  typeof OpenChatOutputSchema
>(
  {
    name: 'openChatFlow',
    inputSchema: OpenChatInputSchema,
    outputSchema: OpenChatOutputSchema,
  },
  async input => {
    const isGreeting = /^(hi|hello|hey|greetings|namaste|majama|kaise ho|sat sri akal)\b/i.test(input.message);
    const creatorInquiry = /(who created you|who built you|who is your creator|creator|origin|tumhara baap kon hai)/i.test(input.message);
    const isHinglish = /([a-zA-Z]\s*(yaar|bhai|acha|theek hai|kya|kaise|tum|tera|meraa|muje|woh)\s*[a-zA-Z])|([a-zA-Z](hai|ho|tha|thi|the)\s*[a-zA-Z])/.test(input.message);

    const {output} = await prompt({...input, isGreeting, creatorInquiry, isHinglish});
    
    // Auto-learning: Store interaction and potentially adjust prompts
    // This is a simplified example; more sophisticated methods could be used
    try {
      // Store the interaction for later review and prompt adjustments
      await storeInteraction(input.message, output!.response);

    } catch (error) {
      console.error('Failed to store interaction:', error);
    }
    
    return output!;
  }
);

/**
 * Stores user interaction data for auto-learning.
 * @param userMessage The user's input message.
 * @param aiResponse The AI's response.
 */
async function storeInteraction(userMessage: string, aiResponse: string): Promise<void> {
  // Implement database storage or file storage logic here
  // This is a placeholder
  console.log('Storing interaction:', { userMessage, aiResponse });
  // Example:
  // const interactionData = { userMessage, aiResponse, timestamp: Date.now() };
  // await db.collection('interactions').add(interactionData);
}
