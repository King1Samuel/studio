'use client';

import React, { useState } from 'react';
import type { ResumeData } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormSection } from '@/components/form-section';
import { Badge } from '@/components/ui/badge';
import { X, PlusCircle } from 'lucide-react';
import { Label } from '../ui/label';

interface SkillsFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

export function SkillsForm({ resumeData, setResumeData }: SkillsFormProps) {
  const [newSkill, setNewSkill] = useState('');
  const [newTool, setNewTool] = useState('');

  const addSkill = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };
  
  const removeSkill = (skillToRemove: string) => {
    setResumeData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };
  
  const addTool = () => {
    if (newTool.trim() && !resumeData.tools.includes(newTool.trim())) {
      setResumeData(prev => ({ ...prev, tools: [...prev.tools, newTool.trim()] }));
      setNewTool('');
    }
  };
  
  const removeTool = (toolToRemove: string) => {
    setResumeData(prev => ({ ...prev, tools: prev.tools.filter(t => t !== toolToRemove) }));
  };

  return (
    <FormSection title="Skills & Tools">
      <div className="space-y-6">
        <div>
          <Label>Key Skills</Label>
          <div className="flex flex-wrap gap-2 p-2 mt-2 border rounded-md min-h-[40px]">
            {resumeData.skills.map(skill => (
              <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                {skill}
                <button onClick={() => removeSkill(skill)} className="rounded-full hover:bg-muted-foreground/20">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Add a new skill"
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <Button onClick={addSkill} variant="outline"><PlusCircle className="h-4 w-4" /></Button>
          </div>
        </div>
        
        <div>
          <Label>Technical Tools</Label>
          <div className="flex flex-wrap gap-2 p-2 mt-2 border rounded-md min-h-[40px]">
            {resumeData.tools.map(tool => (
              <Badge key={tool} variant="secondary" className="flex items-center gap-1">
                {tool}
                <button onClick={() => removeTool(tool)} className="rounded-full hover:bg-muted-foreground/20">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Add a new tool"
              value={newTool}
              onChange={e => setNewTool(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTool())}
            />
            <Button onClick={addTool} variant="outline"><PlusCircle className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </FormSection>
  );
}
