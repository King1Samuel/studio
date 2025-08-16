'use client';

import React, { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Save, FolderOpen, Loader2 } from 'lucide-react';
import { Packer } from 'docx';
import { saveAs } from 'file-saver';
import type { ResumeData } from '@/lib/types';
import { saveResumeAction, loadResumeAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { generateDocx } from '@/lib/docx-generator';
import { generatePdf } from '@/lib/pdf-generator';

interface AppHeaderProps {
  resumePreviewRef: React.RefObject<HTMLDivElement>;
  resumeData: ResumeData
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

export function AppHeader({ resumePreviewRef, resumeData, setResumeData }: AppHeaderProps) {
  const { toast } = useToast();
  const [isSaving, startSaveTransition] = useTransition();
  const [isLoading, startLoadTransition] = useTransition();
  
  const handleSaveResume = () => {
    startSaveTransition(async () => {
      try {
        await saveResumeAction(resumeData);
        toast({ title: 'Success', description: 'Your resume has been saved to the database.' });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Save Failed',
          description: error instanceof Error ? error.message : 'An unknown error occurred.',
        });
      }
    });
  };

  const handleLoadResume = () => {
    startLoadTransition(async () => {
      try {
        const data = await loadResumeAction();
        if (data) {
          setResumeData(data);
          toast({ title: 'Success', description: 'Loaded your saved resume from the database.' });
        } else {
           toast({ title: 'Not Found', description: 'No saved resume was found in the database.' });
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Load Failed',
          description: error instanceof Error ? error.message : 'An unknown error occurred.',
        });
      }
    });
  };

  const handleDownloadPdf = () => {
    generatePdf(resumeData);
  };

  const handleDownloadWord = () => {
    const doc = generateDocx(resumeData);
    Packer.toBlob(doc).then(blob => {
      saveAs(blob, "resume.docx");
    });
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <h1 className="text-xl font-bold font-headline">Resum<span className="text-primary/80">AI</span></h1>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleSaveResume} disabled={isSaving}>
          {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
          Save
        </Button>
        <Button variant="outline" size="sm" onClick={handleLoadResume} disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : <FolderOpen />}
          Load
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
          <Download />
          PDF
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadWord}>
          <Download />
          Word
        </Button>
      </div>
    </header>
  );
}
