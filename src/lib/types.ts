import { z } from 'zod';
import type { ObjectId } from 'mongodb';

export interface WorkExperience {
  id: string;
  role: string;
  company: string;
  dates: string;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  dates: string;
}

export interface ResumeData {
  _id?: ObjectId; // Optional _id field for MongoDB
  name: string;
  title: string;
  contact: {
    email: string;
    phone: string;
    linkedin: string;
    github: string;
  };
  professionalSummary: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: string[];
  tools: string[];
  languages: string[];
  highlights: string;
  links: {
    label: string;
    url: string;
  }[];
}

const WorkExperienceSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  role: z.string(),
  company: z.string(),
  dates: z.string(),
  description: z.string(),
});

const EducationSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  institution: z.string(),
  degree: z.string(),
  dates: z.string(),
});

const LinkSchema = z.object({
  label: z.string(),
  url: z.string(),
});

export const ImportResumeOutputSchema = z.object({
  name: z.string(),
  title: z.string(),
  contact: z.object({
    email: z.string(),
    phone: z.string(),
    linkedin: z.string(),
    github: z.string(),
  }),
  professionalSummary: z.string(),
  workExperience: z.array(WorkExperienceSchema),
  education: z.array(EducationSchema),
  skills: z.array(z.string()),
  tools: z.array(z.string()),
  languages: z.array(z.string()),
  highlights: z.string(),
  links: z.array(LinkSchema),
});

export type ImportResumeOutput = z.infer<typeof ImportResumeOutputSchema>;
