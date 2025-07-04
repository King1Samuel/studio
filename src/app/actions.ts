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
  analyzeJobUrl,
  AnalyzeJobUrlInput,
  AnalyzeJobUrlOutput,
} from '@/ai/flows/analyze-job-url';
import {
  extractJobDescription,
  ExtractJobDescriptionInput,
  ExtractJobDescriptionOutput,
} from '@/ai/flows/extract-job-description';

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

export async function analyzeJobUrlAction(
  input: AnalyzeJobUrlInput
): Promise<AnalyzeJobUrlOutput> {
  try {
    return await analyzeJobUrl(input);
  } catch (error) {
    console.error('Error analyzing job URL:', error);
    throw new Error('Failed to analyze job URL.');
  }
}

export async function extractJobDescriptionAction(
  input: ExtractJobDescriptionInput
): Promise<ExtractJobDescriptionOutput> {
  try {
    return await extractJobDescription(input);
  } catch (error) {
    console.error('Error extracting job description:', error);
    throw new Error('Failed to extract job description.');
  }
}
