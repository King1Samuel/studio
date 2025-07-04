'use server';

/**
 * @fileOverview AI flow to extract a specific job description from a URL given a role title.
 *
 * - extractJobDescription - The main function.
 * - ExtractJobDescriptionInput - The input type.
 * - ExtractJobDescriptionOutput - The output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {fetchUrlContent} from '@/services/scraper';

const getUrlContent = ai.defineTool(
  {
    name: 'getUrlContent',
    description: 'Fetches the text content of a given URL.',
    inputSchema: z.object({
      url: z.string().describe('The URL to fetch content from.'),
    }),
    outputSchema: z.string(),
  },
  async ({url}) => {
    return await fetchUrlContent(url);
  }
);

const ExtractJobDescriptionInputSchema = z.object({
  url: z.string().url().describe('The URL of the job posting.'),
  role: z.string().describe('The title of the job role to extract.'),
});
export type ExtractJobDescriptionInput = z.infer<
  typeof ExtractJobDescriptionInputSchema
>;

const ExtractJobDescriptionOutputSchema = z.object({
  jobDescription: z
    .string()
    .describe('The full job description for the specified role.'),
});
export type ExtractJobDescriptionOutput = z.infer<
  typeof ExtractJobDescriptionOutputSchema
>;

export async function extractJobDescription(
  input: ExtractJobDescriptionInput
): Promise<ExtractJobDescriptionOutput> {
  return extractJobDescriptionFlow(input);
}

const extractJobDescriptionPrompt = ai.definePrompt({
  name: 'extractJobDescriptionPrompt',
  input: {schema: ExtractJobDescriptionInputSchema},
  output: {schema: ExtractJobDescriptionOutputSchema},
  tools: [getUrlContent],
  prompt: `You are an expert at parsing job descriptions from web pages.
    A user has provided a URL: {{{url}}} and wants the description for the role: "{{{role}}}".
    
    First, use the getUrlContent tool to fetch the content of the URL.
    Then, find the specific job description for the "{{{role}}}" role and extract it.
    Populate the 'jobDescription' field with the full description for that role.
    `,
});

const extractJobDescriptionFlow = ai.defineFlow(
  {
    name: 'extractJobDescriptionFlow',
    inputSchema: ExtractJobDescriptionInputSchema,
    outputSchema: ExtractJobDescriptionOutputSchema,
  },
  async input => {
    const {output} = await extractJobDescriptionPrompt(input);
    if (!output) {
      throw new Error('Failed to extract job description.');
    }
    return output;
  }
);
