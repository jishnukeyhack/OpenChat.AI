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

const search = ai.defineTool({
  name: 'search',
  description: 'Searches the web for relevant information.',
  inputSchema: z.object({
    query: z.string().describe('The search query.')
  }),
  outputSchema: z.string()
}, async input => {
  // Replace this with your actual search implementation.
  // For example, you could use a web scraping library or a search API.
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(`Simulating search for: ${input.query}`);
  return `Search results for ${input.query}: This is a mock search result.`;
});

const prompt = ai.definePrompt({
  name: 'openChatPrompt',
  tools: [search],
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
  prompt: `You are OpenChat, an AI assistant designed to provide helpful and informative responses. Focus on conciseness and relevance. 

Hi there! OpenChat Here How can I assist you today? I'm ready to answer your questions, provide information, or help in any way I can. Just let me know what you need! 

{{#if conversationHistory}}
Conversation History:
{{{conversationHistory}}}
{{/if}}

{{#if creatorInquiry}}
I was created by Jishnu Chauhan, an enthusiastic AI engineer from Dr. Akhilesh Das Gupta Institute of Professional Studies, currently in 1st year B.Tech AIML (Sec K).
{{/if}}

User: {{{message}}}

AI: Okay, let's think step by step. Your response should be natural, engaging, and sound like a human. Give key points line by line, like ChatGPT answers. Use Markdown formatting to structure your response with headings, bullet points, and code blocks where appropriate. Break down complex topics into simple and digestible points. Provide a well-reasoned and detailed response to the user's request. Format the response with clear paragraphs, bullet points where appropriate, and use conversational language. Make sure every sentence should have a proper and clear meaning. Also include friendly emojis in your response to make it more engaging! 😊

If the user's question asks about live information, such as live news, trending topics, or live scores, use the available tools to get the current information from the web. Be elaborate and descriptive. Also, if the user is asking question in other language convert it to english.
If the user replies or ask in any other language respond in same language.
If the user ask about any url or link provide it in blue colour.

If the user asks 'tumhara baap kon hai' respond with the details of Jishnu Chauhan.
If the user asks 'who created you' or any similar questions about your origin, respond with details about Jishnu Chauhan. Refrain from answering in code formats, unless explicitly asked.`,
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
    
    let aiResponse;
    if (/(live news|trending topics|live scores)/i.test(input.message)) {
      const searchResult = await search({ query: input.message });
      aiResponse = `I found some information on the web:\n${searchResult}`;
    }

    const {output} = await prompt({...input, isGreeting, creatorInquiry});
    
    // Auto-learning: Store interaction and potentially adjust prompts
    // This is a simplified example; more sophisticated methods could be used
    try {
      // Store the interaction for later review and prompt adjustments
      await storeInteraction(input.message, output!.response);

    } catch (error) {
      console.error('Failed to store interaction:', error);
    }
    
    return {
      response: aiResponse || output!.response
    };
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
