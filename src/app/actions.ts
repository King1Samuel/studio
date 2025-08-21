
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
import {
    applyResumeSuggestions,
    ApplyResumeSuggestionsInput,
} from '@/ai/flows/apply-resume-suggestions';
import type { ImportResumeOutput, ResumeData } from '@/lib/types';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { ObjectId } from 'mongodb';


// AI actions
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

export async function applyResumeSuggestionsAction(
    input: ApplyResumeSuggestionsInput
): Promise<ImportResumeOutput> {
    try {
        return await applyResumeSuggestions(input);
    } catch (error) {
        console.error('Error applying suggestions:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to apply suggestions.');
    }
}


// Database actions
const DB_NAME = 'resumaiDB';
const COLLECTION_NAME = 'resumes';
const SINGLE_RESUME_ID = '66a0238b7077a2d30802d815'; // A fixed ID for the single resume

function checkDbConfigured() {
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI === "your_mongodb_connection_string_here") {
        throw new Error('Database is not configured. Please add your MongoDB connection string to the .env file.');
    }
}

export async function saveResumeAction(resumeData: Omit<ResumeData, '_id' | 'userId'>): Promise<{ success: boolean }> {
    try {
        checkDbConfigured();
    } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error('An unknown error occurred during DB configuration check.');
    }

    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        await collection.updateOne(
            { _id: new ObjectId(SINGLE_RESUME_ID) },
            { $set: { ...resumeData } },
            { upsert: true }
        );
        return { success: true };
    } catch (error) {
        console.error('Error saving resume:', error);
        throw new Error('Failed to save resume to the database.');
    }
}

export async function loadResumeAction(): Promise<ResumeData | null> {
    try {
        checkDbConfigured();
    } catch (error) {
       // Fail gracefully if DB is not configured, but don't throw an error
       // as this action is called on page load.
       console.warn(error instanceof Error ? error.message : 'DB configuration error');
       return null;
    }

    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        const result = await collection.findOne({ _id: new ObjectId(SINGLE_RESUME_ID) });

        if (result) {
            // The _id is not part of the ResumeData type, so we remove it.
            const { _id, ...resumeData } = result;
            return resumeData as ResumeData;
        }
        return null;
    } catch (error) {
        console.error('Error loading resume:', error);
        throw new Error('Failed to load resume from the database.');
    }
}
