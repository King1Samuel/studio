'use client';

import React from 'react';
import type { ResumeData, Education } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FormSection } from '@/components/form-section';
import { Trash2, PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface EducationFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

export function EducationForm({ resumeData, setResumeData }: EducationFormProps) {
  const handleEducationChange = (id: string, field: keyof Omit<Education, 'id'>, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu),
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { id: crypto.randomUUID(), institution: '', degree: '', dates: '' }
      ]
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id),
    }));
  };

  return (
    <FormSection title="Education & Certifications">
      <div className="space-y-4">
        {resumeData.education.map((edu, index) => (
          <Card key={edu.id}>
            <CardContent className="p-4 space-y-4 relative">
               <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={() => removeEducation(edu.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`institution-${edu.id}`}>Institution</Label>
                  <Input id={`institution-${edu.id}`} value={edu.institution} onChange={e => handleEducationChange(edu.id, 'institution', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor={`degree-${edu.id}`}>Degree / Certification</Label>
                  <Input id={`degree-${edu.id}`} value={edu.degree} onChange={e => handleEducationChange(edu.id, 'degree', e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor={`dates-${edu.id}`}>Dates</Label>
                <Input id={`dates-${edu.id}`} value={edu.dates} onChange={e => handleEducationChange(edu.id, 'dates', e.target.value)} />
              </div>
            </CardContent>
          </Card>
        ))}
         <Button variant="outline" onClick={addEducation}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Education
        </Button>
        <div className="pt-4">
            <Label htmlFor="highlights">Additional Certifications (e.g. CISSP, CEH)</Label>
            <Input id="highlights" value={resumeData.highlights} onChange={(e) => setResumeData(prev => ({...prev, highlights: e.target.value}))} />
        </div>
      </div>
    </FormSection>
  );
}
