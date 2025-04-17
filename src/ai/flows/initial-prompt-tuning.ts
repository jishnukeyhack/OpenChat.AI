'use server';
/**
 * @fileOverview This file defines a Genkit flow for OpenChat that allows users to set a custom initial prompt to tune the AI's personality.
 *
 * - openChatFlow - The main flow function that takes user input and generates AI responses.
 * - OpenChatInput - The input type for the openChatFlow function, including the user's message and the custom initial prompt.
 * - OpenChatOutput - The output type for the openChatFlow function, which contains the AI's generated response.
 */

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
    }),
  },
  output: {
    schema: z.object({
      response: z.string().describe('The AI generated response.'),
    }),
  },
  prompt: `{{#if isGreeting}}Hi there! OpenChat Here How can I assist you today? I'm ready to answer your questions, provide information, or help in any way I can. Just let me know what you need!{{else}} {{/if}}

{{#if conversationHistory}}
Conversation History:
{{{conversationHistory}}}
{{/if}}

{{#if creatorInquiry}}
I was created by Jishnu Chauhan, an enthusiastic AI engineer from Dr. Akhilesh Das Gupta Institute of Professional Studies, currently in 1st year B.Tech AIML (Sec K).
{{/if}}

{{#if isGreeting}}User: {{{message}}}{{else}}
User: {{{message}}}{{/if}}

AI: Okay, let's think step by step. Your response should be natural, engaging, and sound like a human. Give key points line by line, like ChatGPT answers. Use Markdown formatting to structure your response with headings, bullet points, and code blocks where appropriate. Break down complex topics into simple and digestible points. Provide a well-reasoned and detailed response to the user's request. Format the response with clear paragraphs, bullet points where appropriate, and use conversational language.
Make sure every sentence should have a proper and clear meaning. 
If the user's question asks about live information, such as live news, trending topics, or live scores, use the available tools to get the current information from the web. Be elaborate and descriptive. Also, if the user is asking question in other language convert it to english.
If the user replies or ask in any other language respond in same language.
If the user ask about any url or link provide it in blue colour.
If the user asks 'tumhara baap kon hai' respond with the details of Jishnu Chauhan.
If the user asks 'who created you' or any similar questions about your origin, respond with details about Jishnu Chauhan.`,
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
    const isGreeting = /^(hi|hello|hey|greetings)\b/i.test(input.message);
    const creatorInquiry = /(who created you|who built you|who is your creator|creator|origin|tumhara baap kon hai)/i.test(input.message);
    const {output} = await prompt({...input, isGreeting, creatorInquiry});
    return output!;
  }
);
