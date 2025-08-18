
'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
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
  const [isLoading, startLoadTransition] = useTransition();

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

  useEffect(() => {
    // Automatically load data when component mounts
    handleLoadResume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="min-h-screen bg-background text-foreground font-body flex flex-col">
      <AppHeader resumePreviewRef={resumePreviewRef} resumeData={resumeData} />
      <main className="flex-1 lg:grid lg:grid-cols-2 h-[calc(100vh-4rem)]">
        {/* Desktop View: Side-by-side */}
        <div className="hidden lg:block h-full">
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="p-8">
              <ResumeForm 
                resumeData={resumeData} 
                setResumeData={setResumeData} 
                onLoadResume={handleLoadResume}
                isLoadingResume={isLoading}
              />
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
                    <ResumeForm 
                      resumeData={resumeData} 
                      setResumeData={setResumeData} 
                      onLoadResume={handleLoadResume}
                      isLoadingResume={isLoading}
                    />
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
