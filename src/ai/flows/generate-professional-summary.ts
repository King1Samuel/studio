'use server';

/**
 * @fileOverview AI flow to generate a professional summary for a resume based on work experience and skills.
 *
 * - generateProfessionalSummary - A function that generates the professional summary.
 * - GenerateProfessionalSummaryInput - The input type for the generateProfessionalSummary function.
 * - GenerateProfessionalSummaryOutput - The return type for the generateProfessionalSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProfessionalSummaryInputSchema = z.object({
  workExperience: z
    .string()
    .describe('A detailed description of your past work experience.'),
  skills: z.string().describe('A list of your key skills.'),
});
export type GenerateProfessionalSummaryInput = z.infer<
  typeof GenerateProfessionalSummaryInputSchema
>;

const GenerateProfessionalSummaryOutputSchema = z.object({
  professionalSummary: z
    .string()
    .describe('A professional summary highlighting the qualifications.'),
});
export type GenerateProfessionalSummaryOutput = z.infer<
  typeof GenerateProfessionalSummaryOutputSchema
>;

export async function generateProfessionalSummary(
  input: GenerateProfessionalSummaryInput
): Promise<GenerateProfessionalSummaryOutput> {
  return generateProfessionalSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProfessionalSummaryPrompt',
  input: {schema: GenerateProfessionalSummaryInputSchema},
  output: {schema: GenerateProfessionalSummaryOutputSchema},
  prompt: `You are a professional resume writer. Generate a professional summary based on the work experience and skills provided.

Work Experience: {{{workExperience}}}
Skills: {{{skills}}}

Professional Summary:`,
});

const generateProfessionalSummaryFlow = ai.defineFlow(
  {
    name: 'generateProfessionalSummaryFlow',
    inputSchema: GenerateProfessionalSummaryInputSchema,
    outputSchema: GenerateProfessionalSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
