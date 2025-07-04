'use client';

import React from 'react';
import type { ResumeData, WorkExperience } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FormSection } from '@/components/form-section';
import { Trash2, PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ExperienceFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

export function ExperienceForm({ resumeData, setResumeData }: ExperienceFormProps) {
  const handleExperienceChange = (id: string, field: keyof Omit<WorkExperience, 'id'>, value: string) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp),
    }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      workExperience: [
        ...prev.workExperience,
        { id: crypto.randomUUID(), role: '', company: '', dates: '', description: '' }
      ]
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter(exp => exp.id !== id),
    }));
  };

  return (
    <FormSection title="Work Experience">
      <div className="space-y-4">
        {resumeData.workExperience.map((exp, index) => (
          <Card key={exp.id}>
            <CardContent className="p-4 space-y-4 relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={() => removeExperience(exp.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`role-${exp.id}`}>Role</Label>
                  <Input id={`role-${exp.id}`} value={exp.role} onChange={e => handleExperienceChange(exp.id, 'role', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor={`company-${exp.id}`}>Company</Label>
                  <Input id={`company-${exp.id}`} value={exp.company} onChange={e => handleExperienceChange(exp.id, 'company', e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor={`dates-${exp.id}`}>Dates</Label>
                <Input id={`dates-${exp.id}`} value={exp.dates} onChange={e => handleExperienceChange(exp.id, 'dates', e.target.value)} />
              </div>
              <div>
                <Label htmlFor={`description-${exp.id}`}>Description</Label>
                <Textarea id={`description-${exp.id}`} className="min-h-[100px]" value={exp.description} onChange={e => handleExperienceChange(exp.id, 'description', e.target.value)} placeholder="One achievement per line..."/>
              </div>
            </CardContent>
          </Card>
        ))}
        <Button variant="outline" onClick={addExperience}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Experience
        </Button>
      </div>
    </FormSection>
  );
}
