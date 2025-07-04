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

const getUrlContent = ai.defineTool(
  {
    name: 'getUrlContent',
    description:
      'Fetches the text content of a given URL. Useful for when a user provides a URL for a job description.',
    inputSchema: z.object({
      url: z.string().describe('The URL of the job posting.'),
    }),
    outputSchema: z.string(),
  },
  async ({url}) => {
    return await fetchUrlContent(url);
  }
);

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

const analyzeJobUrlPrompt = ai.definePrompt({
  name: 'analyzeJobUrlPrompt',
  input: {schema: AnalyzeJobUrlInputSchema},
  output: {schema: AnalyzeJobUrlOutputSchema},
  tools: [getUrlContent],
  prompt: `You are an expert at parsing job descriptions from web pages.
    A user has provided a URL: {{{url}}}.
    First, use the getUrlContent tool to fetch the content of the URL.
    Then, analyze the content to identify all distinct job roles and their descriptions.

    - If you find only ONE job role, extract its full job description. Populate the 'jobDescription' field with it, and the 'roles' array with the single job title.
    - If you find MULTIPLE job roles, list all the job titles you found in the 'roles' array. Do NOT populate the 'jobDescription' field.
    - If you find NO job roles, return an empty 'roles' array.
    `,
});

const analyzeJobUrlFlow = ai.defineFlow(
  {
    name: 'analyzeJobUrlFlow',
    inputSchema: AnalyzeJobUrlInputSchema,
    outputSchema: AnalyzeJobUrlOutputSchema,
  },
  async input => {
    const {output} = await analyzeJobUrlPrompt(input);
    if (!output) {
      throw new Error('Failed to analyze job URL.');
    }
    return output;
  }
);
