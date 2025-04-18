'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing images and files.
 *
 * - analyzeFileFlow - The main flow function that takes an image or file URL and analyzes it.
 * - AnalyzeFileInput - The input type for the analyzeFileFlow function, which includes the image or file URL.
 * - AnalyzeFileOutput - The output type for the analyzeFileFlow function, which contains the AI's analysis of the image or file.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnalyzeFileInputSchema = z.object({
  fileUrl: z.string().describe('The URL of the file or image to analyze.'),
  fileType: z.string().describe('The type of the file (image, pdf, text, etc.)'),
});
export type AnalyzeFileInput = z.infer<typeof AnalyzeFileInputSchema>;

const AnalyzeFileOutputSchema = z.object({
  analysis: z.string().describe('The AI generated analysis of the image or file.'),
});
export type AnalyzeFileOutput = z.infer<typeof AnalyzeFileOutputSchema>;

export async function analyzeFile(input: AnalyzeFileInput): Promise<AnalyzeFileOutput> {
  return analyzeFileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFilePrompt',
  input: {
    schema: z.object({
      fileUrl: z.string().describe('The URL of the file to analyze.'),
      fileType: z.string().describe('The type of the file (image, pdf, text, etc.)'),
    }),
  },
  output: {
    schema: z.object({
      analysis: z.string().describe('The AI generated analysis of the image or file.'),
    }),
  },
  prompt: `You are an expert AI assistant specialized in analyzing various types of files.
You will receive a URL pointing to a file and its type, and your task is to provide a detailed and relevant analysis.
Ensure your analysis is tailored to the file type. Provide key insights and relevant information.
Present the analysis in a clear, concise, and human-readable format, focusing on the most important aspects.

Here are some examples on how to analyze files:
- Images: Identify objects, people, scenes, and provide a description of the visual content.
- PDF: Summarize the document, extract key information, and identify the main topics.
- Text files: Analyze the text, identify the main themes, and extract relevant data.

File URL: {{{fileUrl}}}
File Type: {{{fileType}}}

AI:`,
});

const analyzeFileFlow = ai.defineFlow<
  typeof AnalyzeFileInputSchema,
  typeof AnalyzeFileOutputSchema
>(
  {
    name: 'analyzeFileFlow',
    inputSchema: AnalyzeFileInputSchema,
    outputSchema: AnalyzeFileOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
