'use client';

import React, { useTransition, useState } from 'react';
import type { ResumeData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { tailorResumeAction } from '@/app/actions';
import { PersonalDetailsForm } from './forms/personal-details-form';
import { ProfessionalSummaryForm } from './forms/professional-summary-form';
import { ExperienceForm } from './forms/experience-form';
import { EducationForm } from './forms/education-form';
import { SkillsForm } from './forms/skills-form';
import { MiscForm } from './forms/misc-form';

interface ResumeFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

export function ResumeForm({ resumeData, setResumeData }: ResumeFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [jobDescription, setJobDescription] = useState('');
  const [tailoringResult, setTailoringResult] = useState<{ tailoredResume: string; suggestions: string } | null>(null);

  const stringifyResume = (data: ResumeData) => {
    let resumeString = `Name: ${data.name}\nTitle: ${data.title}\n\n`;
    resumeString += `Summary:\n${data.professionalSummary}\n\n`;
    resumeString += 'Experience:\n';
    data.workExperience.forEach(exp => {
      resumeString += `- ${exp.role} at ${exp.company} (${exp.dates})\n${exp.description}\n`;
    });
    resumeString += '\nEducation:\n';
    data.education.forEach(edu => {
      resumeString += `- ${edu.degree} from ${edu.institution} (${edu.dates})\n`;
    });
    resumeString += `\nSkills: ${data.skills.join(', ')}\n`;
    return resumeString;
  };

  const handleTailorResume = () => {
    if (!jobDescription.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Job description cannot be empty.' });
      return;
    }
    startTransition(async () => {
      try {
        const resumeString = stringifyResume(resumeData);
        const result = await tailorResumeAction({ resume: resumeString, jobDescription });
        setTailoringResult(result);
        toast({ title: 'Success', description: 'Resume tailored successfully. Review the suggestions.' });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to tailor resume.' });
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-headline">Resume Editor</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>✨ Tailor with AI</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Tailor Resume for a Job</DialogTitle>
              <DialogDescription>
                Paste a job description below. Our AI will analyze it and suggest improvements to your resume.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Textarea
                placeholder="Paste job description here..."
                className="min-h-[200px]"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <Button onClick={handleTailorResume} disabled={isPending}>
                {isPending ? 'Analyzing...' : 'Generate Suggestions'}
              </Button>
            </div>
            {tailoringResult && (
              <div className="space-y-4 max-h-[40vh] overflow-y-auto">
                <div>
                  <h3 className="font-bold mb-2">AI Suggestions</h3>
                  <p className="text-sm p-4 bg-muted rounded-md whitespace-pre-wrap">{tailoringResult.suggestions}</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">AI Tailored Resume (Copy and paste sections as needed)</h3>
                  <p className="text-sm p-4 bg-muted rounded-md whitespace-pre-wrap">{tailoringResult.tailoredResume}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <PersonalDetailsForm resumeData={resumeData} setResumeData={setResumeData} />
      <ProfessionalSummaryForm resumeData={resumeData} setResumeData={setResumeData} />
      <ExperienceForm resumeData={resumeData} setResumeData={setResumeData} />
      <EducationForm resumeData={resumeData} setResumeData={setResumeData} />
      <SkillsForm resumeData={resumeData} setResumeData={setResumeData} />
      <MiscForm resumeData={resumeData} setResumeData={setResumeData} />
    </div>
  );
}
