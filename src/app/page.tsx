'use client';

import { useState, useRef } from 'react';
import { AppHeader } from '@/components/header';
import { ResumeForm } from '@/components/resume-form';
import { ResumePreview } from '@/components/resume-preview';
import type { ResumeData } from '@/lib/types';
import { initialData } from '@/lib/initial-data';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Home() {
  const [resumeData, setResumeData] = useState<ResumeData>(initialData);
  const resumePreviewRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-background text-foreground font-body flex flex-col">
      <AppHeader resumePreviewRef={resumePreviewRef} resumeData={resumeData}/>
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-4rem)]">
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="p-8">
            <ResumeForm resumeData={resumeData} setResumeData={setResumeData} />
          </div>
        </ScrollArea>
        <ScrollArea className="h-[calc(100vh-4rem)] bg-muted/30">
          <div className="p-8 flex justify-center">
            <ResumePreview ref={resumePreviewRef} data={resumeData} />
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
