'use server';

/**
 * @fileOverview AI flow to apply tailoring suggestions to a resume.
 *
 * - applyResumeSuggestions - The main function.
 * - ApplyResumeSuggestionsInput - The input type.
 * - ApplyResumeSuggestionsOutput - The output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { ImportResumeOutputSchema, type ResumeData } from '@/lib/types';
import type { ImportResumeOutput } from '@/lib/types';

const ApplyResumeSuggestionsInputSchema = z.object({
  resumeData: ImportResumeOutputSchema.describe("The current JSON object representing the user's resume."),
  suggestions: z.string().describe("The bulleted list of suggestions on how to improve the resume."),
});

export type ApplyResumeSuggestionsInput = z.infer<typeof ApplyResumeSuggestionsInputSchema>;

export async function applyResumeSuggestions(
  input: ApplyResumeSuggestionsInput
): Promise<ImportResumeOutput> {
  return applyResumeSuggestionsFlow(input);
}

const applySuggestionsPrompt = ai.definePrompt({
  name: 'applyResumeSuggestionsPrompt',
  input: {schema: ApplyResumeSuggestionsInputSchema},
  output: {schema: ImportResumeOutputSchema},
  prompt: `You are an expert resume editor. Your task is to modify a resume, which is provided as a JSON object, based on a list of suggestions.

You must carefully review each suggestion and apply it to the corresponding field in the resume JSON object.
- Update text fields like the professional summary or work experience descriptions.
- Add or rephrase skills and tools.
- Ensure the final output is a valid JSON object that strictly adheres to the provided schema.
- Do not invent new information; only modify the resume based on the given suggestions.
- Do not modify the IDs of work experience or education entries.

Current Resume JSON:
---
{{{json resumeData}}}
---

Suggestions to implement:
---
{{{suggestions}}}
---

Return the complete, updated resume as a valid JSON object.`,
});

const applyResumeSuggestionsFlow = ai.defineFlow(
  {
    name: 'applyResumeSuggestionsFlow',
    inputSchema: ApplyResumeSuggestionsInputSchema,
    outputSchema: ImportResumeOutputSchema,
  },
  async (input) => {
    const {output} = await applySuggestionsPrompt(input);
    if (!output) {
      throw new Error('AI failed to apply suggestions to the resume.');
    }
    return output;
  }
);
