'use server';

/**
 * @fileOverview AI flow to analyze a job posting URL and identify all job roles.
 *
 * - analyzeJobUrl - A function that handles the URL analysis.
 * - AnalyzeJobUrlInput - The input type.
 * - AnalyzeJobUrlOutput - The output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {fetchUrlContent} from '@/services/scraper';

const AnalyzeJobUrlInputSchema = z.object({
  url: z.string().url().describe('The URL of the job posting.'),
});
export type AnalyzeJobUrlInput = z.infer<typeof AnalyzeJobUrlInputSchema>;

const AnalyzeJobUrlOutputSchema = z.object({
  roles: z
    .array(z.string())
    .describe(
      'A list of all distinct job role titles found at the URL. If no roles are found, this will be an empty array.'
    ),
});
export type AnalyzeJobUrlOutput = z.infer<typeof AnalyzeJobUrlOutputSchema>;

export async function analyzeJobUrl(
  input: AnalyzeJobUrlInput
): Promise<AnalyzeJobUrlOutput> {
  return analyzeJobUrlFlow(input);
}

const analyzeContentPrompt = ai.definePrompt({
  name: 'analyzeJobContentPrompt',
  input: {
    schema: z.object({
      url: z.string().url(),
      pageContent: z.string(),
    }),
  },
  output: {schema: AnalyzeJobUrlOutputSchema},
  prompt: `You are an expert at parsing job descriptions from web pages.
    A user has provided a URL: {{{url}}}.
    You have been given the raw HTML content of that URL.
    Analyze the HTML to identify all distinct job roles. Ignore any content inside <style> or <script> tags unless it is JSON-LD (<script type="application/ld+json">), which often contains structured job data.
    List all the job titles you found in the 'roles' array.
    If you find NO job roles, return an empty 'roles' array.

    Here is the page content:
    ---
    {{{pageContent}}}
    ---
    `,
});

const analyzeJobUrlFlow = ai.defineFlow(
  {
    name: 'analyzeJobUrlFlow',
    inputSchema: AnalyzeJobUrlInputSchema,
    outputSchema: AnalyzeJobUrlOutputSchema,
  },
  async input => {
    const pageContent = await fetchUrlContent(input.url);

    if (!pageContent) {
      return {roles: []};
    }

    // Truncate content to avoid exceeding model context window
    const truncatedContent = pageContent.substring(0, 30000);

    const {output} = await analyzeContentPrompt({
      ...input,
      pageContent: truncatedContent,
    });

    if (!output) {
      throw new Error('AI failed to analyze the page content.');
    }
    return output;
  }
);
