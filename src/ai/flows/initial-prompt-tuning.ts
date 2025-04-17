'use server';
/**
 * @fileOverview This file defines a Genkit flow for OpenChat that allows users to set a custom initial prompt to tune the AI's personality.
 *
 * - openChatFlow - The main flow function that takes user input and generates AI responses with a custom initial prompt.
 * - OpenChatInput - The input type for the openChatFlow function, including the user's message and the custom initial prompt.
 * - OpenChatOutput - The output type for the openChatFlow function, which contains the AI's generated response.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const OpenChatInputSchema = z.object({
  message: z.string().describe('The user message to be processed.'),
  initialPrompt: z.string().describe('The custom initial prompt to tune the AI personality.'),
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
      initialPrompt: z.string().describe('The custom initial prompt to tune the AI personality.'),
    }),
  },
  output: {
    schema: z.object({
      response: z.string().describe('The AI generated response.'),
    }),
  },
  prompt: `{{initialPrompt}}

User: {{{message}}}

AI: Okay, let's think step by step. Respond to the user's message in a way that is natural, engaging, and sounds like a human. Use Markdown formatting to structure your response with headings, bullet points, and code blocks where appropriate. Break down complex topics into simple and digestible points. Provide a well-reasoned and detailed response to the user's request. Format the response with clear paragraphs, bullet points where appropriate, and use conversational language.

If the user's question asks about live information, such as live news, trending topics, or live scores, use the available tools to get the current information from the web.`,
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
    const {output} = await prompt(input);
    return output!;
  }
);
