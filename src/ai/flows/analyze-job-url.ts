'use server';

/**
 * @fileOverview AI flow to analyze a job posting URL.
 * It extracts job roles and if there are multiple, asks the user to select one.
 * If only one is found, it extracts the job description.
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
      'A list of job roles found at the URL. If only one role is found, this will contain a single element.'
    ),
  jobDescription: z
    .string()
    .optional()
    .describe(
      'The full job description for a single role if only one is found. If multiple roles are found, this will be empty.'
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
    You have been given the text content of that URL, which might be messy and include HTML or Javascript code.
    Analyze the content to identify all distinct job roles and their descriptions.

    - If you find only ONE job role:
      - Try to extract its full job description.
      - If you can find the description, populate the 'jobDescription' field with it, and the 'roles' array with the single job title.
      - If you can find the job title but CANNOT find a clear job description, populate the 'roles' array with the single job title and leave the 'jobDescription' field empty.
    - If you find MULTIPLE job roles, list all the job titles you found in the 'roles' array. Do NOT populate the 'jobDescription' field.
    - If you find NO job roles, return an empty 'roles' array.
    - IMPORTANT: Never return "undefined" or "null" as a string value in any field. If a field should be empty, either omit it (if optional) or use an empty string.

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
