
'use server';
import { cookies } from 'next/headers';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { app } from '@/lib/firebase'; // Assuming you have this from a previous step
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

// Auth actions
const AuthSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

async function getUserIdFromSession(): Promise<string | null> {
    const sessionCookie = cookies().get('firebase-session')?.value;
    if (!sessionCookie) return null;
    // In a real app, you would verify this token with Firebase Admin SDK
    // For this prototype, we'll assume the cookie value is the user's UID
    // This is NOT secure for production.
    return sessionCookie;
}

export async function loginAction(credentials: z.infer<typeof AuthSchema>) {
  try {
    const auth = getAuth(app);
    const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
    const idToken = await userCredential.user.getIdToken();

    // In a real app, you'd send this token to your backend to create a session cookie.
    // For this prototype, we'll set a simple cookie with the UID.
    // This is NOT secure for production.
    cookies().set('firebase-session', userCredential.user.uid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function signupAction(credentials: z.infer<typeof AuthSchema>) {
    try {
        const auth = getAuth(app);
        await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function logoutAction() {
    cookies().delete('firebase-session');
    return { success: true };
}


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

export async function saveResumeAction(resumeData: Omit<ResumeData, '_id' | 'userId'>): Promise<{ success: boolean }> {
    const userId = await getUserIdFromSession();
    if (!userId) {
        throw new Error('You must be logged in to save a resume.');
    }

    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

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
    const userId = await getUserIdFromSession();
    if (!userId) {
        // This is not an error, it just means no user is logged in.
        return null;
    }

    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        const result = await collection.findOne({ userId: userId });

        if (result) {
            // The _id and userId are not part of the ResumeData type, so we remove them.
            const { _id, userId, ...resumeData } = result;
            return resumeData as ResumeData;
        }
        return null;
    } catch (error) {
        console.error('Error loading resume:', error);
        throw new Error('Failed to load resume from the database.');
    }
}
