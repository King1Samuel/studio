'use server';

/**
 * @fileOverview AI flow to analyze a job posting URL to find all job roles and extract their full descriptions.
 *
 * - analyzeAndExtractJobs - The main function.
 * - AnalyzeAndExtractJobsInput - The input type.
 * - AnalyzeAndExtractJobsOutput - The output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {fetchUrlContent} from '@/services/scraper';

const AnalyzeAndExtractJobsInputSchema = z.object({
  url: z.string().url().describe('The URL of the job posting.'),
});
export type AnalyzeAndExtractJobsInput = z.infer<typeof AnalyzeAndExtractJobsInputSchema>;


const JobDetailSchema = z.object({
    role: z.string().describe("The full title of the job role."),
    description: z.string().describe("The full, complete job description for this specific role, including all responsibilities, qualifications, and requirements. If you cannot find a description, provide a clear message stating that it could not be extracted.")
});

const AnalyzeAndExtractJobsOutputSchema = z.object({
  jobs: z
    .array(JobDetailSchema)
    .describe(
      'A list of all distinct jobs found at the URL. If no roles are found, this will be an empty array.'
    ),
});
export type AnalyzeAndExtractJobsOutput = z.infer<typeof AnalyzeAndExtractJobsOutputSchema>;


export async function analyzeAndExtractJobs(
  input: AnalyzeAndExtractJobsInput
): Promise<AnalyzeAndExtractJobsOutput> {
  return analyzeAndExtractJobsFlow(input);
}

const analyzeContentPrompt = ai.definePrompt({
  name: 'analyzeAndExtractJobsPrompt',
  input: {
    schema: z.object({
      url: z.string().url(),
      pageContent: z.string(),
    }),
  },
  output: {schema: AnalyzeAndExtractJobsOutputSchema},
  prompt: `You are an expert at parsing job descriptions from web pages.
    A user has provided a URL: {{{url}}}.
    You have been given the raw HTML content of that URL.
    Your task is to analyze the entire HTML content, including script tags which may contain JSON data, to identify all distinct job roles and their full descriptions.

    For each distinct job you find, create an object with the full 'role' title and the complete 'description'.
    The description must be the full text, including all responsibilities, qualifications, requirements, etc.
    
    If you find a role but cannot extract its description, the 'description' field should contain a helpful message like "Could not extract the job description for this role. The content might be missing or unclear."
    If you find NO job roles on the page, return an empty 'jobs' array.

    Here is the page content:
    ---
    {{{pageContent}}}
    ---
    `,
});

const analyzeAndExtractJobsFlow = ai.defineFlow(
  {
    name: 'analyzeAndExtractJobsFlow',
    inputSchema: AnalyzeAndExtractJobsInputSchema,
    outputSchema: AnalyzeAndExtractJobsOutputSchema,
  },
  async input => {
    const pageContent = await fetchUrlContent(input.url);

    if (!pageContent) {
      return {jobs: []};
    }

    // Truncate content to avoid exceeding model context window
    const truncatedContent = pageContent.substring(0, 150000);

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
