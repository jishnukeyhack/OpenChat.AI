'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating code based on a user prompt.
 *
 * - generateCodeFlow - The main flow function that takes a prompt and generates code.
 * - GenerateCodeInput - The input type for the generateCodeFlow function, including the user's prompt.
 * - GenerateCodeOutput - The output type for the generateCodeFlow function, which contains the generated code.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateCodeInputSchema = z.object({
  prompt: z.string().describe('The user prompt for generating code.'),
});
export type GenerateCodeInput = z.infer<typeof GenerateCodeInputSchema>;

const GenerateCodeOutputSchema = z.object({
  code: z.string().describe('The AI generated code.'),
});
export type GenerateCodeOutput = z.infer<typeof GenerateCodeOutputSchema>;

export async function generateCode(input: GenerateCodeInput): Promise<GenerateCodeOutput> {
  return generateCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodePrompt',
  input: {
    schema: z.object({
      prompt: z.string().describe('The user prompt for generating code.'),
    }),
  },
  output: {
    schema: z.object({
      code: z.string().describe('The AI generated code.'),
    }),
  },
  prompt: `You are a code generation AI.  You will be given a prompt that describes the code to generate.  You will respond with the code. Do not include any other information other than the code.

Prompt: {{{prompt}}}

AI: ```javascript`,
});

const generateCodeFlow = ai.defineFlow<
  typeof GenerateCodeInputSchema,
  typeof GenerateCodeOutputSchema
>(
  {
    name: 'generateCodeFlow',
    inputSchema: GenerateCodeInputSchema,
    outputSchema: GenerateCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
