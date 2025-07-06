'use client';

import React, { useTransition, useState } from 'react';
import type { ResumeData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { tailorResumeAction, analyzeJobUrlAction, extractJobDescriptionAction } from '@/app/actions';
import { PersonalDetailsForm } from './forms/personal-details-form';
import { ProfessionalSummaryForm } from './forms/professional-summary-form';
import { ExperienceForm } from './forms/experience-form';
import { EducationForm } from './forms/education-form';
import { SkillsForm } from './forms/skills-form';
import { MiscForm } from './forms/misc-form';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';


interface ResumeFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

export function ResumeForm({ resumeData, setResumeData }: ResumeFormProps) {
  const { toast } = useToast();
  const [isTailoring, startTailoringTransition] = useTransition();
  const [jobDescription, setJobDescription] = useState('');
  const [tailoringResult, setTailoringResult] = useState<{ tailoredResume: string; suggestions: string } | null>(null);

  // New states for URL feature
  const [jobUrl, setJobUrl] = useState('');
  const [isAnalyzingUrl, setIsAnalyzingUrl] = useState(false);
  const [isExtractingDesc, setIsExtractingDesc] = useState(false);
  const [foundRoles, setFoundRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState('');

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

  const resetDialogState = () => {
    setJobDescription('');
    setTailoringResult(null);
    setJobUrl('');
    setFoundRoles([]);
    setSelectedRole('');
  };

  const handleTailorResume = () => {
    if (!jobDescription.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Job description cannot be empty.' });
      return;
    }
    startTailoringTransition(async () => {
      try {
        setTailoringResult(null);
        const resumeString = stringifyResume(resumeData);
        const result = await tailorResumeAction({ resume: resumeString, jobDescription });
        setTailoringResult(result);
        toast({ title: 'Success', description: 'Resume tailored successfully. Review the suggestions.' });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to tailor resume.' });
      }
    });
  };

  const handleAnalyzeUrl = async () => {
    if (!jobUrl.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a URL.' });
      return;
    }
    setIsAnalyzingUrl(true);
    setJobDescription('');
    setFoundRoles([]);
    setTailoringResult(null);
    try {
      const result = await analyzeJobUrlAction({ url: jobUrl });
      if (result.jobDescription) {
        setJobDescription(result.jobDescription);
        toast({ title: 'Success', description: 'Extracted job description from URL.' });
      } else if (result.roles.length > 0) {
        setFoundRoles(result.roles);
        toast({ title: 'Multiple Roles Found', description: 'Please select a role to continue.' });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not find any job roles at the URL.' });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred. Please try again.',
      });
    } finally {
      setIsAnalyzingUrl(false);
    }
  };
  
  const handleExtractDescription = async () => {
    if (!selectedRole) return;
    setIsExtractingDesc(true);
    setJobDescription('');
    setTailoringResult(null);
    try {
      const result = await extractJobDescriptionAction({ url: jobUrl, role: selectedRole });
      setJobDescription(result.jobDescription);
      setFoundRoles([]); // Clear roles selection
      toast({ title: 'Success', description: `Extracted description for ${selectedRole}.` });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Extraction Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred. Please try again.',
      });
    } finally {
      setIsExtractingDesc(false);
    }
  };

  const onDialogOpenChange = (open: boolean) => {
    if (!open) {
      resetDialogState();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-headline">Resume Editor</h2>
        <Dialog onOpenChange={onDialogOpenChange}>
          <DialogTrigger asChild>
            <Button>✨ Tailor with AI</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Tailor Resume for a Job</DialogTitle>
              <DialogDescription>
                Paste a job URL or description below. Our AI will analyze it and suggest improvements to your resume.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="job-url">Job Posting URL</Label>
                <div className="flex items-center gap-2">
                  <Input 
                      id="job-url"
                      placeholder="https://example.com/job-posting" 
                      value={jobUrl}
                      onChange={(e) => setJobUrl(e.target.value)} 
                      disabled={isAnalyzingUrl || isExtractingDesc}
                  />
                  <Button onClick={handleAnalyzeUrl} disabled={isAnalyzingUrl || !jobUrl}>
                      {isAnalyzingUrl ? 'Analyzing...' : 'Analyze URL'}
                  </Button>
                </div>
              </div>
              
              {foundRoles.length > 0 && (
                <div className="space-y-2 p-4 border rounded-md bg-muted/50">
                  <Label>We found multiple roles. Please select one:</Label>
                  <div className="flex items-center gap-2">
                      <Select onValueChange={setSelectedRole} value={selectedRole} disabled={isExtractingDesc}>
                          <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                              {foundRoles.map(role => (
                                  <SelectItem key={role} value={role}>{role}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                      <Button onClick={handleExtractDescription} disabled={isExtractingDesc || !selectedRole}>
                          {isExtractingDesc ? 'Getting...' : 'Get Description'}
                      </Button>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="job-description">Job Description</Label>
                <Textarea
                  id="job-description"
                  placeholder="Paste job description here, or it will be filled in from the URL analysis."
                  className="min-h-[200px]"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  disabled={isAnalyzingUrl || isExtractingDesc}
                />
                <div className="flex justify-end">
                  <Button onClick={handleTailorResume} disabled={isTailoring || !jobDescription}>
                    {isTailoring ? 'Tailoring...' : 'Generate Suggestions'}
                  </Button>
                </div>
              </div>
            </div>

            {tailoringResult && (
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pt-4 border-t">
                <div>
                  <h3 className="font-bold mb-2">AI Suggestions</h3>
                  <div className="text-sm p-4 bg-muted rounded-md whitespace-pre-wrap">{tailoringResult.suggestions}</div>
                </div>
                <div>
                  <h3 className="font-bold mb-2">AI Tailored Resume (Copy and paste sections as needed)</h3>
                  <div className="text-sm p-4 bg-muted rounded-md whitespace-pre-wrap">{tailoringResult.tailoredResume}</div>
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
