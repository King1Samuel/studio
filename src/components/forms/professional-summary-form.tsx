'use client';

import React, { useTransition } from 'react';
import type { ResumeData } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FormSection } from '@/components/form-section';
import { generateSummaryAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

interface ProfessionalSummaryFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

export function ProfessionalSummaryForm({ resumeData, setResumeData }: ProfessionalSummaryFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleGenerateSummary = () => {
    startTransition(async () => {
      try {
        const result = await generateSummaryAction({
          workExperience: resumeData.workExperience.map(exp => `- ${exp.role} at ${exp.company}:\n${exp.description}`).join('\n\n'),
          skills: resumeData.skills.join(', '),
        });
        setResumeData(prev => ({ ...prev, professionalSummary: result.professionalSummary }));
        toast({ title: 'Success', description: 'Professional summary generated.' });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate summary.' });
      }
    });
  };

  return (
    <FormSection title="Professional Summary">
      <div className="space-y-2">
        <Label htmlFor="summary">Summary</Label>
        <Textarea
          id="summary"
          className="min-h-[120px]"
          value={resumeData.professionalSummary}
          onChange={(e) => setResumeData(prev => ({ ...prev, professionalSummary: e.target.value }))}
        />
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleGenerateSummary} disabled={isPending}>
            {isPending ? 'Generating...' : '✨ Generate with AI'}
          </Button>
        </div>
      </div>
    </FormSection>
  );
}
