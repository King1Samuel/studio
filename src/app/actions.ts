
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
import { cookies } from 'next/headers';

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


// Auth actions
export async function logoutAction() {
  cookies().delete('session');
  return { success: true };
}


// Database actions
const DB_NAME = 'resumaiDB';
const COLLECTION_NAME = 'resumes';

function checkDbConfigured() {
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI === "your_mongodb_connection_string_here") {
        throw new Error('Database is not configured. Please add your MongoDB connection string to the .env file.');
    }
}

async function getUserIdFromSession(): Promise<string | null> {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session');
    return sessionCookie ? sessionCookie.value : null;
}

export async function saveResumeAction(resumeData: Omit<ResumeData, '_id' | 'userId'>): Promise<{ success: boolean }> {
    try {
        checkDbConfigured();
    } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error('An unknown error occurred during DB configuration check.');
    }
    
    const userId = await getUserIdFromSession();

    if (!userId) {
        throw new Error("You must be logged in to save a resume.");
    }

    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // We use the user's ID to find their resume document.
        // `upsert: true` will create the document if it doesn't exist.
        await collection.updateOne(
            { userId: userId },
            { $set: { ...resumeData, userId } },
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
       console.warn(error instanceof Error ? error.message : 'DB configuration error');
       return null;
    }

    const userId = await getUserIdFromSession();

     if (!userId) {
        // Not an error, just means no one is logged in.
        return null;
    }

    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        const result = await collection.findOne({ userId });

        if (result) {
            // Ensure you don't send back the MongoDB internal _id
            const { _id, ...resumeData } = result;
            return resumeData as ResumeData;
        }
        return null;
    } catch (error) {
        console.error('Error loading resume:', error);
        throw new Error('Failed to load resume from the database.');
    }
}
