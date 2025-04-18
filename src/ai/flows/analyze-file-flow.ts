'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing images.
 *
 * - analyzeImageFlow - The main flow function that takes an image URL and analyzes the image.
 * - AnalyzeImageInput - The input type for the analyzeImageFlow function, which includes the image URL.
 * - AnalyzeImageOutput - The output type for the analyzeImageFlow function, which contains the AI's analysis of the image.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnalyzeImageInputSchema = z.object({
  imageUrl: z.string().describe('The URL of the image to analyze.'),
});
export type AnalyzeImageInput = z.infer<typeof AnalyzeImageInputSchema>;

const AnalyzeImageOutputSchema = z.object({
  analysis: z.string().describe('The AI generated analysis of the image.'),
});
export type AnalyzeImageOutput = z.infer<typeof AnalyzeImageOutputSchema>;

export async function analyzeImage(input: AnalyzeImageInput): Promise<AnalyzeImageOutput> {
  return analyzeImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeImagePrompt',
  input: {
    schema: z.object({
      imageUrl: z.string().describe('The URL of the image to analyze.'),
    }),
  },
  output: {
    schema: z.object({
      analysis: z.string().describe('The AI generated analysis of the image.'),
    }),
  },
  prompt: `You are an AI image analysis expert. You will be given the URL of an image, and you will analyze the image and provide a detailed description of the image, including the objects, people, and scenes in the image.
Image URL: {{{imageUrl}}}
AI:`,
});

const analyzeImageFlow = ai.defineFlow<
  typeof AnalyzeImageInputSchema,
  typeof AnalyzeImageOutputSchema
>(
  {
    name: 'analyzeImageFlow',
    inputSchema: AnalyzeImageInputSchema,
    outputSchema: AnalyzeImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
