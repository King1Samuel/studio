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
  prompt: `You are an expert resume parser. Your task is to analyze the following resume text and extract the information into a structured JSON object according to the provided schema.

- Meticulously parse all sections: contact information, professional summary, work experience, education, skills, tools, languages, highlights/certifications, and links.
- For 'workExperience' and 'education' entries, ensure each distinct position or degree is a separate object in the array.
- For the 'description' field within 'workExperience', combine multi-line bullet points from the source text into a single line. Each distinct achievement or bullet point must start with a hyphen '-'.
- For 'contact' details, extract email, phone, and full URLs for LinkedIn and GitHub if available. If a URL is incomplete (e.g., "linkedin.com/in/name"), reconstruct the full URL (e.g., "https://linkedin.com/in/name").
- 'skills' and 'tools' should be arrays of strings.
- 'highlights' should contain certifications like CISSP or CEH.
- 'links' should be an array of objects, each with a 'label' and a 'url'.
- If a section is not present in the resume text, return an empty string or an empty array for the corresponding field in the JSON object.

Resume Text to be parsed:
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
        throw new Error("The AI model failed to parse the resume. The resume may be in an unsupported format or too complex.")
    }

    // Ensure IDs are unique, as the model might hallucinate or omit them.
    output.workExperience = output.workExperience.map(exp => ({ ...exp, id: crypto.randomUUID() }));
    output.education = output.education.map(edu => ({ ...edu, id: crypto.randomUUID() }));

    return output;
  }
);
