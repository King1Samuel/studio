'use client';

import { useState, useRef, useEffect } from 'react';
import { AppHeader } from '@/components/header';
import { ResumeForm } from '@/components/resume-form';
import { ResumePreview } from '@/components/resume-preview';
import type { ResumeData } from '@/lib/types';
import { initialData } from '@/lib/initial-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { loadResumeAction } from './actions';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [resumeData, setResumeData] = useState<ResumeData>(initialData);
  const resumePreviewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadResumeAction();
        if (data) {
          setResumeData(data);
          toast({ title: 'Resume Loaded', description: 'Successfully loaded your saved resume from the database.' });
        }
      } catch (error) {
        console.error("Failed to load resume on startup:", error);
        // Do not show a toast on initial load failure, as it might just mean no resume is saved yet.
      }
    };
    loadData();
  }, [toast]);


  return (
    <div className="min-h-screen bg-background text-foreground font-body flex flex-col">
      <AppHeader resumePreviewRef={resumePreviewRef} resumeData={resumeData} setResumeData={setResumeData}/>
      <main className="flex-1 lg:grid lg:grid-cols-2 h-[calc(100vh-4rem)]">
        {/* Desktop View: Side-by-side */}
        <div className="hidden lg:block h-full">
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="p-8">
              <ResumeForm resumeData={resumeData} setResumeData={setResumeData} />
            </div>
          </ScrollArea>
        </div>
        <div className="hidden lg:block h-full bg-muted/30">
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="p-8 flex justify-center">
              <ResumePreview ref={resumePreviewRef} data={resumeData} />
            </div>
          </ScrollArea>
        </div>

        {/* Mobile View: Tabs */}
        <div className="lg:hidden p-4 sm:p-6 h-full">
           <Tabs defaultValue="editor" className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="editor" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                 <div className="p-4 pt-6">
                    <ResumeForm resumeData={resumeData} setResumeData={setResumeData} />
                 </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="preview" className="flex-1 overflow-hidden">
               <ScrollArea className="h-full">
                <div className="p-4 pt-6 flex justify-center">
                  <ResumePreview ref={resumePreviewRef} data={resumeData} />
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
