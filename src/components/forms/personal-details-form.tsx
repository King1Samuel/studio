'use client';

import React from 'react';
import type { ResumeData } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormSection } from '@/components/form-section';

interface PersonalDetailsFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

export function PersonalDetailsForm({ resumeData, setResumeData }: PersonalDetailsFormProps) {
  const handleChange = (field: string, value: string) => {
    setResumeData((prev) => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      contact: { ...prev.contact, [field]: value },
    }));
  };

  return (
    <FormSection title="Personal Details">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={resumeData.name} onChange={(e) => handleChange('name', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="title">Job Title</Label>
            <Input id="title" value={resumeData.title} onChange={(e) => handleChange('title', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={resumeData.contact.email} onChange={(e) => handleContactChange('email', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={resumeData.contact.phone} onChange={(e) => handleContactChange('phone', e.target.value)} />
          </div>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
            <Input id="linkedin" value={resumeData.contact.linkedin} onChange={(e) => handleContactChange('linkedin', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="github">GitHub Profile URL</Label>
            <Input id="github" value={resumeData.contact.github} onChange={(e) => handleContactChange('github', e.target.value)} />
          </div>
        </div>
      </div>
    </FormSection>
  );
}
