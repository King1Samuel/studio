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
    You have been given the raw HTML content from a web page and are asked to find the full job description for the role titled: "{{{role}}}".
    
    Scour the document and find the specific, full job description for ONLY the "{{{role}}}" role. Extract the entire description, including requirements, responsibilities, qualifications, etc. Ignore any content inside <style> or <script> tags unless it is JSON-LD (<script type="application/ld+json">), which often contains structured job data.
    Convert the extracted description to clean, readable text.
    
    If you cannot find a clear, distinct job description for this specific role, return a helpful message in the 'jobDescription' field like "Could not extract the job description for the selected role. The content might be missing or unclear."
    
    IMPORTANT: Do not return "string", "undefined", or "null". You must return the full text of the job description you found, or the helpful error message if you could not find it.
    
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

    // Truncate content to avoid exceeding model context window
    const truncatedContent = pageContent.substring(0, 30000);

    const {output} = await extractContentPrompt({
      role: input.role,
      pageContent: truncatedContent,
    });

    if (!output) {
      throw new Error(
        'AI failed to extract the job description from the page content.'
      );
    }
    return output;
  }
);
