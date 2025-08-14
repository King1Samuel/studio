// src/ai/flows/tailor-resume.ts
'use server';

/**
 * @fileOverview A resume tailoring AI agent. It tailors the resume to a job description.
 *
 * - tailorResume - A function that handles the resume tailoring process.
 * - TailorResumeInput - The input type for the tailorResume function.
 * - TailorResumeOutput - The return type for the tailorResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TailorResumeInputSchema = z.object({
  resume: z.string().describe('The resume content to be tailored.'),
  jobDescription: z.string().describe('The job description to tailor the resume to.'),
});
export type TailorResumeInput = z.infer<typeof TailorResumeInputSchema>;

const TailorResumeOutputSchema = z.object({
  tailoredResume: z.string().describe('The tailored resume content.'),
  suggestions: z.string().describe('Suggestions for improving the resume.'),
  recommendations: z.string().describe('A summary of recommended courses and projects to bridge skill gaps, presented in markdown format with clickable links.'),
});
export type TailorResumeOutput = z.infer<typeof TailorResumeOutputSchema>;

export async function tailorResume(input: TailorResumeInput): Promise<TailorResumeOutput> {
  return tailorResumeFlow(input);
}

const tailorResumePrompt = ai.definePrompt({
  name: 'tailorResumePrompt',
  input: {schema: TailorResumeInputSchema},
  output: {schema: TailorResumeOutputSchema},
  prompt: `You are an expert resume writer and career coach.

You will tailor a resume to a job description.

First, analyze the job description and identify the key skills and experiences required.
Then, rewrite the resume to highlight those skills and experiences.
Provide suggestions for improving the resume.

Finally, based on the gap between the resume and the job description, recommend courses (from YouTube or paid sites like Udemy, Coursera, etc.) and hands-on projects the user can undertake to become a better candidate. 
IMPORTANT: For each course or project, you MUST provide a direct, clickable URL. Format these recommendations in markdown. For example: "[Course Name](https://example.com/course-link)".

Job Description:
{{{jobDescription}}}

Resume:
{{{resume}}}

Tailored Resume:
`,
});

const tailorResumeFlow = ai.defineFlow(
  {
    name: 'tailorResumeFlow',
    inputSchema: TailorResumeInputSchema,
    outputSchema: TailorResumeOutputSchema,
  },
  async input => {
    const {output} = await tailorResumePrompt(input);
    return output!;
  }
);
