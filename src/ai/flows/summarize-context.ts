// 'use server';
/**
 * @fileOverview Summarizes the context of the current conversation.
 *
 * - summarizeContext - A function that summarizes the context of the current conversation.
 * - SummarizeContextInput - The input type for the summarizeContext function.
 * - SummarizeContextOutput - The return type for the summarizeContext function.
 */

'use server';

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeContextInputSchema = z.object({
  conversationHistory: z
    .string()
    .describe('The entire history of the conversation thus far.'),
});
export type SummarizeContextInput = z.infer<typeof SummarizeContextInputSchema>;

const SummarizeContextOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the conversation history.'),
});
export type SummarizeContextOutput = z.infer<typeof SummarizeContextOutputSchema>;

export async function summarizeContext(
  input: SummarizeContextInput
): Promise<SummarizeContextOutput> {
  return summarizeContextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeContextPrompt',
  input: {
    schema: z.object({
      conversationHistory: z
        .string()
        .describe('The entire history of the conversation thus far.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z
        .string()
        .describe('A concise summary of the conversation history.'),
    }),
  },
  prompt: `Summarize the following conversation history in a concise manner:\n\n{{{conversationHistory}}}`,
});

const summarizeContextFlow = ai.defineFlow<
  typeof SummarizeContextInputSchema,
  typeof SummarizeContextOutputSchema
>(
  {
    name: 'summarizeContextFlow',
    inputSchema: SummarizeContextInputSchema,
    outputSchema: SummarizeContextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

