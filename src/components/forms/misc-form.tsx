'use client';

import React from 'react';
import type { ResumeData } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FormSection } from '@/components/form-section';
import { Trash2, PlusCircle } from 'lucide-react';

interface MiscFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

export function MiscForm({ resumeData, setResumeData }: MiscFormProps) {
  
  const handleLanguageChange = (index: number, value: string) => {
    setResumeData(prev => ({
      ...prev,
      languages: prev.languages.map((lang, i) => (i === index ? value : lang)),
    }));
  };

  const addLanguage = () => {
    setResumeData(prev => ({ ...prev, languages: [...prev.languages, ''] }));
  };

  const removeLanguage = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
  };
  
  const handleLinkChange = (index: number, field: 'label' | 'url', value: string) => {
    setResumeData(prev => ({
      ...prev,
      links: prev.links.map((link, i) => i === index ? { ...link, [field]: value } : link),
    }));
  };

  const addLink = () => {
    setResumeData(prev => ({ ...prev, links: [...prev.links, { label: '', url: '' }] }));
  };

  const removeLink = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  return (
    <FormSection title="Other Sections">
      <div className="space-y-6">
        <div>
          <Label>Languages</Label>
          <div className="space-y-2 mt-2">
            {resumeData.languages.map((lang, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input value={lang} onChange={e => handleLanguageChange(index, e.target.value)} />
                <Button variant="ghost" size="icon" onClick={() => removeLanguage(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addLanguage}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Language
            </Button>
          </div>
        </div>
        
        <div>
          <Label>Links to Certifications / Portfolio</Label>
          <div className="space-y-2 mt-2">
            {resumeData.links.map((link, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1">
                  <Input placeholder="Label (e.g., CISSP Cert)" value={link.label} onChange={e => handleLinkChange(index, 'label', e.target.value)} />
                  <Input placeholder="URL" value={link.url} onChange={e => handleLinkChange(index, 'url', e.target.value)} />
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeLink(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addLink}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Link
            </Button>
          </div>
        </div>
      </div>
    </FormSection>
  );
}
