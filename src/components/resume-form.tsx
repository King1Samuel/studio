'use client';

import React, { useTransition, useState, useRef, useEffect } from 'react';
import type { ResumeData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { tailorResumeAction, analyzeAndExtractJobsAction, importResumeAction, applyResumeSuggestionsAction } from '@/app/actions';
import { PersonalDetailsForm } from './forms/personal-details-form';
import { ProfessionalSummaryForm } from './forms/professional-summary-form';
import { ExperienceForm } from './forms/experience-form';
import { EducationForm } from './forms/education-form';
import { SkillsForm } from './forms/skills-form';
import { MiscForm } from './forms/misc-form';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ExternalLink, Upload, Loader2 } from 'lucide-react';
import { Separator } from './ui/separator';

interface ResumeFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

interface FoundJob {
  role: string;
  description: string;
}

export function ResumeForm({ resumeData, setResumeData }: ResumeFormProps) {
  const { toast } = useToast();
  const [isTailoring, startTailoringTransition] = useTransition();
  const [isImporting, startImportingTransition] = useTransition();
  const [isApplying, startApplyingTransition] = useTransition();

  const [jobDescription, setJobDescription] = useState('');
  const [tailoringResult, setTailoringResult] = useState<{ suggestions: string; recommendations: string; } | null>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const [pdfjs, setPdfjs] = useState<any>(null);

  // New states for URL feature
  const [jobUrl, setJobUrl] = useState('');
  const [isAnalyzingUrl, setIsAnalyzingUrl] = useState(false);
  const [foundJobs, setFoundJobs] = useState<FoundJob[]>([]);
  const [selectedRole, setSelectedRole] = useState('');

  const [isTailorDialogOpen, setIsTailorDialogOpen] = useState(false);


  useEffect(() => {
    // Dynamically import pdfjs-dist only on the client side
    import('pdfjs-dist').then(pdfjsDist => {
      // Required for pdfjs-dist to work
      pdfjsDist.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsDist.version}/build/pdf.worker.min.mjs`;
      setPdfjs(pdfjsDist);
    });
  }, []);

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
    setFoundJobs([]);
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
  
  const handleViewRecommendations = () => {
    if (tailoringResult?.recommendations) {
      try {
        const encodedRecommendations = btoa(tailoringResult.recommendations);
        const url = `/recommendations?data=${encodeURIComponent(encodedRecommendations)}`;
        const newWindow = window.open(url, '_blank');

        if (!newWindow) {
          toast({ variant: 'destructive', title: 'Error', description: 'Please allow pop-ups for this site to view recommendations.' });
        }
      } catch (e) {
        console.error("Error encoding or opening recommendations:", e);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not open recommendations page.' });
      }
    }
  };

  const handleApplySuggestions = () => {
    if (!tailoringResult?.suggestions) return;

    startApplyingTransition(async () => {
        try {
            const updatedResume = await applyResumeSuggestionsAction({
                resumeData,
                suggestions: tailoringResult.suggestions
            });
            setResumeData(updatedResume);
            toast({ title: 'Success', description: 'AI suggestions have been applied to your resume.' });
            setIsTailorDialogOpen(false); // Close the main dialog
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Apply Failed',
                description: error instanceof Error ? error.message : 'An unknown error occurred.',
            });
        }
    });
  };
  
  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleAnalyzeUrl = async () => {
    let urlToAnalyze = jobUrl.trim();
    if (!urlToAnalyze) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a URL.' });
      return;
    }

    if (!urlToAnalyze.startsWith('http://') && !urlToAnalyze.startsWith('https://')) {
        urlToAnalyze = 'https://' + urlToAnalyze;
    }

    if (!isValidUrl(urlToAnalyze)) {
      toast({
        variant: 'destructive',
        title: 'Invalid URL',
        description: 'Please enter a valid web address.',
      });
      return;
    }
    
    setIsAnalyzingUrl(true);
    setJobDescription('');
    setFoundJobs([]);
    setSelectedRole('');
    setTailoringResult(null);
    try {
      const result = await analyzeAndExtractJobsAction({ url: urlToAnalyze });
      
      if (result.jobs.length === 1) {
        const job = result.jobs[0];
        toast({ title: 'Role Found', description: `Found and extracted: ${job.role}.` });
        setJobDescription(job.description);
        setFoundJobs([]);
        setSelectedRole('');
      } else if (result.jobs.length > 1) {
        setFoundJobs(result.jobs);
        toast({ title: 'Multiple Roles Found', description: 'Please select a role to continue.' });
      } else {
        toast({ variant: 'destructive', title: 'No Roles Found', description: 'Could not find any job roles at the URL. Please paste the description manually.' });
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
  
  const handleRoleSelection = (role: string) => {
    setSelectedRole(role);
    const selectedJob = foundJobs.find(job => job.role === role);
    if (selectedJob) {
        setJobDescription(selectedJob.description);
        toast({ title: 'Role Selected', description: `Loaded description for ${role}.`});
    }
  };

  const handleImportClick = () => {
    importFileInputRef.current?.click();
  };
  
  const processResumeText = (text: string) => {
      if (text) {
        startImportingTransition(async () => {
          try {
            const importedData = await importResumeAction({ resumeText: text });
            setResumeData(importedData);
            toast({ title: 'Success', description: 'Resume imported successfully.' });
          } catch (error) {
            toast({
              variant: 'destructive',
              title: 'Import Failed',
              description: error instanceof Error ? error.message : 'An unknown error occurred.',
            });
          }
        });
      }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    if (file.type === 'application/pdf') {
        if (!pdfjs) {
            toast({ variant: 'destructive', title: 'PDF Library not ready', description: 'Please wait a moment and try again.' });
            return;
        }
        reader.onload = async (e) => {
            if (!e.target?.result) return;
            try {
                const pdf = await pdfjs.getDocument({ data: e.target.result as ArrayBuffer }).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map((item: any) => ('str' in item ? item.str : '')).join(' ');
                }
                processResumeText(fullText);
            } catch (error) {
                 toast({ variant: 'destructive', title: 'PDF Error', description: 'Could not parse the PDF file.' });
            }
        };
        reader.readAsArrayBuffer(file);
    } else {
        reader.onload = (e) => {
            const text = e.target?.result as string;
            processResumeText(text);
        };
        reader.readAsText(file);
    }

    // Reset file input value to allow re-uploading the same file
    if(importFileInputRef.current) {
        importFileInputRef.current.value = '';
    }
  };

  const onDialogOpenChange = (open: boolean) => {
    setIsTailorDialogOpen(open);
    if (!open) {
      resetDialogState();
    }
  };
  
  const hasActionableSuggestions = tailoringResult?.suggestions && tailoringResult.suggestions.trim().startsWith('-');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-headline">Resume Editor</h2>
        <div className="flex items-center gap-2">
           <input
            type="file"
            ref={importFileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".txt,.md,.pdf"
          />
          <Button variant="outline" onClick={handleImportClick} disabled={isImporting}>
            {isImporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Import Resume
          </Button>
          <Dialog open={isTailorDialogOpen} onOpenChange={onDialogOpenChange}>
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
                        placeholder="example.com/job-posting" 
                        value={jobUrl}
                        onChange={(e) => setJobUrl(e.target.value)} 
                        disabled={isAnalyzingUrl}
                    />
                    <Button onClick={handleAnalyzeUrl} disabled={isAnalyzingUrl || !jobUrl}>
                        {isAnalyzingUrl ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : 'Analyze URL'}
                    </Button>
                  </div>
                </div>
                
                {foundJobs.length > 0 && (
                  <div className="space-y-2 p-4 border rounded-md bg-muted/50">
                    <Label>We found multiple roles. Please select one:</Label>
                    <div className="flex items-center gap-2">
                        <Select onValueChange={handleRoleSelection} value={selectedRole}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {foundJobs.map(job => (
                                    <SelectItem key={job.role} value={job.role}>{job.role}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                    disabled={isAnalyzingUrl}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleTailorResume} disabled={isTailoring || !jobDescription}>
                      {isTailoring ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Tailoring...</> : 'Generate Suggestions'}
                    </Button>
                  </div>
                </div>
              </div>

              {tailoringResult && (
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pt-4 border-t">
                   {tailoringResult.recommendations && (
                    <div>
                      <h3 className="font-bold mb-2">Recommendations</h3>
                       <Button onClick={handleViewRecommendations} variant="outline" size="sm">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Courses & Projects
                      </Button>
                    </div>
                   )}
                  <div>
                    <h3 className="font-bold mb-2">AI Suggestions</h3>
                    <div className="text-sm p-4 bg-muted rounded-md whitespace-pre-wrap">{tailoringResult.suggestions}</div>
                  </div>
                   {hasActionableSuggestions && (
                     <>
                        <Separator />
                        <div className="p-4 bg-background rounded-md space-y-3">
                            <h4 className="font-semibold">Implement Suggestions?</h4>
                            <p className="text-sm text-muted-foreground">
                                Would you like the AI to automatically apply these suggestions to your resume?
                            </p>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                      toast({ title: "Great!", description: "You can apply the suggestions manually." });
                                      setIsTailorDialogOpen(false);
                                    }}
                                >
                                    No, thanks
                                </Button>
                                <Button onClick={handleApplySuggestions} disabled={isApplying}>
                                  {isApplying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  Yes, apply changes
                                </Button>
                            </div>
                        </div>
                     </>
                   )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
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
