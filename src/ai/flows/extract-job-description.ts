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

const extractContentPrompt = ai.definePrompt({
  name: 'extractJobContentPrompt',
  input: {
    schema: z.object({
      role: z.string(),
      pageContent: z.string(),
    }),
  },
  output: {schema: ExtractJobDescriptionOutputSchema},
  prompt: `You are an expert at parsing job descriptions from web pages.
    You have been given the content from a job posting URL and are asked to find the description for the role: "{{{role}}}".
    
    Find the specific job description for the "{{{role}}}" role from the content below and extract it.
    Populate the 'jobDescription' field with the full description for that role.
    
    Page Content:
    ---
    {{{pageContent}}}
    ---
    `,
});

const extractJobDescriptionFlow = ai.defineFlow(
  {
    name: 'extractJobDescriptionFlow',
    inputSchema: ExtractJobDescriptionInputSchema,
    outputSchema: ExtractJobDescriptionOutputSchema,
  },
  async input => {
    const pageContent = await fetchUrlContent(input.url);

    if (!pageContent) {
      return {jobDescription: 'Could not retrieve content from the provided URL.'};
    }

    const {output} = await extractContentPrompt({
      role: input.role,
      pageContent,
    });

    if (!output) {
      throw new Error(
        'AI failed to extract the job description from the page content.'
      );
    }
    return output;
  }
);
