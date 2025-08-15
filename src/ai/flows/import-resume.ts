'use server';

/**
 * @fileOverview AI flow to parse a resume text and extract structured data.
 *
 * - importResume - A function that handles the resume parsing.
 * - ImportResumeInput - The input type.
 * - ImportResumeOutput - The output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { ImportResumeOutputSchema } from '@/lib/types';
import type { ImportResumeOutput } from '@/lib/types';


const ImportResumeInputSchema = z.object({
  resumeText: z.string().describe('The raw text content of the resume.'),
});
export type ImportResumeInput = z.infer<typeof ImportResumeInputSchema>;


export async function importResume(
  input: ImportResumeInput
): Promise<ImportResumeOutput> {
  return importResumeFlow(input);
}

const importResumePrompt = ai.definePrompt({
  name: 'importResumePrompt',
  input: {schema: ImportResumeInputSchema},
  output: {schema: ImportResumeOutputSchema},
  prompt: `You are an expert resume parser. Analyze the following resume text and extract the information into a structured JSON object.

The user's entire resume is provided below. Your task is to meticulously extract every piece of relevant information and format it according to the specified JSON schema.

- For 'workExperience', ensure each job is a separate object.
- CRITICAL: In the 'description' for each job, each distinct achievement or bullet point from the original resume should be a single line in the output. If a bullet point wraps to a new line in the source text, combine it into one line.
- Each line in the 'description' should start with a hyphen '-'.
- For 'education', do the same for descriptions if any.
- For 'contact', extract email, phone, and full URLs for LinkedIn and GitHub if available. If a URL is just a path (e.g., linkedin.com/in/name), reconstruct the full URL (e.g., https://linkedin.com/in/name).
- 'skills' and 'tools' should be lists of strings.
- 'highlights' should contain certifications like CISSP or CEH.
- 'links' should be an array of objects with 'label' and 'url'.

Resume Text:
---
{{{resumeText}}}
---
`,
});

const importResumeFlow = ai.defineFlow(
  {
    name: 'importResumeFlow',
    inputSchema: ImportResumeInputSchema,
    outputSchema: ImportResumeOutputSchema,
  },
  async input => {
    const {output} = await importResumePrompt(input);
    if (!output) {
        throw new Error("AI failed to parse the resume.")
    }

    // Ensure IDs are unique, as model might hallucinate them
    output.workExperience = output.workExperience.map(exp => ({ ...exp, id: crypto.randomUUID() }));
    output.education = output.education.map(edu => ({ ...edu, id: crypto.randomUUID() }));

    return output;
  }
);
