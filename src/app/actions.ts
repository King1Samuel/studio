'use server';

import {
  generateProfessionalSummary,
  GenerateProfessionalSummaryInput,
  GenerateProfessionalSummaryOutput,
} from '@/ai/flows/generate-professional-summary';
import {
  tailorResume,
  TailorResumeInput,
  TailorResumeOutput,
} from '@/ai/flows/tailor-resume';
import {
  analyzeAndExtractJobs,
  AnalyzeAndExtractJobsInput,
  AnalyzeAndExtractJobsOutput,
} from '@/ai/flows/analyze-and-extract-jobs';
import {
  importResume,
  ImportResumeInput,
} from '@/ai/flows/import-resume';
import type { ImportResumeOutput } from '@/lib/types';


export async function generateSummaryAction(
  input: GenerateProfessionalSummaryInput
): Promise<GenerateProfessionalSummaryOutput> {
  try {
    return await generateProfessionalSummary(input);
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate professional summary.');
  }
}

// Note: The TailorResumeOutput type from the flow no longer includes tailoredResume.
// The client-side component has been updated to reflect this.
export async function tailorResumeAction(
  input: TailorResumeInput
): Promise<TailorResumeOutput> {
  try {
    return await tailorResume(input);
  } catch (error) {
    console.error('Error tailoring resume:', error);
    throw new Error('Failed to tailor resume.');
  }
}

export async function analyzeAndExtractJobsAction(
  input: AnalyzeAndExtractJobsInput
): Promise<AnalyzeAndExtractJobsOutput> {
  try {
    return await analyzeAndExtractJobs(input);
  } catch (error) {
    console.error('Error analyzing job URL:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to analyze job URL.');
  }
}

export async function importResumeAction(
  input: ImportResumeInput
): Promise<ImportResumeOutput> {
  try {
    return await importResume(input);
  } catch (error) {
    console.error('Error importing resume:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to import resume.');
  }
}
