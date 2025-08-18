
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Download, LogOut } from 'lucide-react';
import { Packer } from 'docx';
import { saveAs } from 'file-saver';
import type { ResumeData } from '@/lib/types';
import { logoutAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { generateDocx } from '@/lib/docx-generator';
import { generatePdf } from '@/lib/pdf-generator';

interface AppHeaderProps {
  resumePreviewRef: React.RefObject<HTMLDivElement>;
  resumeData: ResumeData
}

export function AppHeader({ resumePreviewRef, resumeData }: AppHeaderProps) {
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = async () => {
    try {
        await logoutAction();
        toast({ title: "Logged Out", description: "You have been successfully logged out." });
        router.push('/login');
    } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Logout Failed',
          description: error instanceof Error ? error.message : 'An unknown error occurred.',
        });
    }
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
        <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
          <Download />
          PDF
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadWord}>
          <Download />
          Word
        </Button>
         <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut />
            Logout
        </Button>
      </div>
    </header>
  );
}
