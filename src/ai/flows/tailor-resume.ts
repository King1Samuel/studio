'use server';

/**
 * @fileOverview A resume tailoring AI agent. It provides suggestions to tailor a resume to a job description.
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
  suggestions: z.string().describe('A bulleted list of actionable suggestions for improving the resume, or a positive confirmation message if the resume is already a good fit.'),
  recommendations: z.string().describe('A summary of recommended courses and projects to bridge skill gaps, presented in markdown format with clickable links. This should be empty if no significant gaps are found.'),
});
export type TailorResumeOutput = z.infer<typeof TailorResumeOutputSchema>;

export async function tailorResume(input: TailorResumeInput): Promise<TailorResumeOutput> {
  return tailorResumeFlow(input);
}

const tailorResumePrompt = ai.definePrompt({
  name: 'tailorResumePrompt',
  input: {schema: TailorResumeInputSchema},
  output: {schema: TailorResumeOutputSchema},
  prompt: `You are an expert resume writer and career coach. Your task is to help a user tailor their resume to a specific job description.

First, analyze the provided resume and job description to determine if the resume is a strong fit for the role.

- **If the resume is already a strong match for the job description**: Your primary goal is to provide positive reinforcement. For the 'suggestions' field, return a cheerful and encouraging message like "This is a great fit! Your resume aligns well with the job description. You are good to go!" or "Excellent match! Your skills and experience are very relevant to this role. Well done!". For the 'recommendations' field, return an empty string.

- **If the resume is NOT a strong match**: Generate two things:
1.  **Suggestions**: Provide a clear, concise, and actionable bulleted list of suggestions for how the user can improve their resume. Focus on highlighting the most relevant skills and experiences. For example: "- In your summary, emphasize your experience with SIEM tools as mentioned in the job description." or "- Quantify your achievement in the 'DataProtect Inc.' role by adding metrics, like the percentage of incidents you resolved."

2.  **Recommendations**: Based on the gap between the resume and the job description, recommend online courses (from platforms like YouTube, Udemy, Coursera, etc.) and hands-on projects the user can undertake to become a better candidate.
    IMPORTANT: For each course or project, you MUST provide a direct, clickable URL. Format these recommendations in markdown. For example: "[Course Name](https://example.com/course-link)".

Job Description:
{{{jobDescription}}}

Resume:
{{{resume}}}
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
