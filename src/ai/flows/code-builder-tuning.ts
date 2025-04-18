'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating code based on a user prompt.
 *
 * - generateCodeFlow - The main flow function that takes a prompt and generates code, remembering previous code.
 * - GenerateCodeInput - The input type for the generateCodeFlow function, including the user's prompt, language, and previous code.
 * - GenerateCodeOutput - The output type for the generateCodeFlow function, which contains the generated code.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateCodeInputSchema = z.object({
  prompt: z.string().describe('The user prompt for generating code.'),
  language: z.string().optional().describe('The programming language for the code.'),
  previousCode: z.string().optional().describe('The previously generated code to build upon.'),
});
export type GenerateCodeInput = z.infer<typeof GenerateCodeInputSchema>;

const GenerateCodeOutputSchema = z.object({
  code: z.string().describe('The AI generated code, potentially incorporating previous code.'),
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
      language: z.string().optional().describe('The programming language for the code.'),
      previousCode: z.string().optional().describe('The previously generated code to build upon.'),
    }),
  },
  output: {
    schema: z.object({
      code: z.string().describe('The AI generated code.'),
    }),
  },
  prompt: `You are a code generation AI. You will be given a prompt that describes the code to generate, and the language to use.  If previous code is provided, integrate the new code seamlessly with the old code. Generate the code quickly and efficiently. You will respond with the code, making sure to include proper syntax highlighting. Do not include any other information other than the code.

{{#if previousCode}}
Previous Code:
{{{previousCode}}}

Now, integrate this code with the new functionality described in the prompt.
{{/if}}

Prompt: {{{prompt}}}
Language: {{{language}}}

AI:`,
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
    const language = input.language || 'javascript';
    return {code: '```' + language + '\n' + output!.code + '\n```'};
  }
);
