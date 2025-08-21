
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
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { initialData } from '@/lib/initial-data';
import { adminAuth } from '@/lib/firebase-admin';


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
const LoginSchema = z.object({
  email: z.string(),
  password: z.string(),
});
type LoginInput = z.infer<typeof LoginSchema>;

export async function loginAction(input: LoginInput) {
  try {
    const auth = getAuth(app);
    const userCredential = await signInWithEmailAndPassword(auth, input.email, input.password);
    const idToken = await userCredential.user.getIdToken();
    cookies().set('session', idToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24, path: '/' });
    return { success: true };
  } catch(error: any) {
    return { success: false, error: error.message };
  }
}

async function getUserIdFromSession(): Promise<string | null> {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) return null;

    try {
        const decodedToken = await adminAuth.verifyIdToken(sessionToken);
        return decodedToken.uid;
    } catch (error) {
        console.error("Error verifying session token:", error);
        // If token is invalid, delete the cookie
        cookies().delete('session');
        return null;
    }
}


export async function signUpAction(input: LoginInput) {
  try {
    const auth = getAuth(app);
    const userCredential = await createUserWithEmailAndPassword(auth, input.email, input.password);
    const userId = userCredential.user.uid;

    await checkDbConfigured();
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Check if an unclaimed resume exists with this email
    const existingResume = await collection.findOne({ 'contact.email': input.email, userId: { $exists: false } });

    if (existingResume) {
      // If it exists, claim it by adding the new userId
      await collection.updateOne(
        { _id: existingResume._id },
        { $set: { userId: userId } }
      );
    } else {
      // If not, create a new blank resume for the user
      const { name, title, contact, ...restOfInitialData } = initialData;

      const newUserResumeData = {
        ...restOfInitialData,
        userId: userId,
        name: 'Your Name', 
        title: 'Your Title',
        contact: {
          ...contact,
          email: input.email,
          phone: '',
          linkedin: '',
          github: '',
        },
        professionalSummary: 'A brief summary of your professional background.',
        workExperience: [],
        education: [],
        skills: [],
        tools: [],
        languages: [],
        highlights: '',
        links: [],
      };
      await collection.insertOne(newUserResumeData);
    }

    return { success: true };
  } catch(error: any) {
    if (error.code === 'auth/email-already-in-use') {
         return { success: false, error: "This email is already in use. Please try logging in." };
    }
    if (error.code === 'auth/weak-password') {
         return { success: false, error: "The password is too weak. It should be at least 6 characters long." };
    }
    console.error("Sign up error:", error);
    return { success: false, error: error.message };
  }
}

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
            const { _id, ...resumeData } = result;
            return resumeData as ResumeData;
        }
        // If no resume is found for the user (e.g., first login after signup),
        // we can return null and the frontend will handle it.
        return null;
    } catch (error) {
        console.error('Error loading resume:', error);
        throw new Error('Failed to load resume from the database.');
    }
}
