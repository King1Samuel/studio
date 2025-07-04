'use client';

import React from 'react';
import type { ResumeData } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

interface ResumePreviewProps {
  data: ResumeData;
}

const ResumeSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-6">
    <h2 className="text-lg font-bold uppercase tracking-widest text-primary/90 mb-2 pb-1 border-b-2 border-accent">{title}</h2>
    <div className="text-sm">{children}</div>
  </section>
);

export const ResumePreview = React.forwardRef<HTMLDivElement, ResumePreviewProps>(({ data }, ref) => {
  return (
    <div
      ref={ref}
      className="w-full max-w-[8.5in] bg-card p-12 text-foreground font-headline shadow-lg rounded-md border"
      style={{ aspectRatio: '8.5 / 11' }}
    >
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold">{data.name}</h1>
        <p className="text-lg font-medium text-primary/80">{data.title}</p>
        <div className="flex justify-center gap-4 text-xs mt-2 text-muted-foreground">
          <span>{data.contact.email}</span>
          <span>|</span>
          <span>{data.contact.phone}</span>
          {data.contact.linkedin && (
            <>
              <span>|</span>
              <span>{data.contact.linkedin}</span>
            </>
          )}
          {data.contact.github && (
            <>
             <span>|</span>
             <span>{data.contact.github}</span>
            </>
          )}
        </div>
      </header>

      <div className="space-y-4">
        <ResumeSection title="Professional Summary">
          <p className="whitespace-pre-wrap">{data.professionalSummary}</p>
        </ResumeSection>

        <ResumeSection title="Work Experience">
          {data.workExperience.map((exp) => (
            <div key={exp.id} className="mb-4">
              <h3 className="font-bold">{exp.role}</h3>
              <div className="flex justify-between text-sm italic">
                <p>{exp.company}</p>
                <p>{exp.dates}</p>
              </div>
              <ul className="mt-1 list-disc list-inside space-y-1">
                {exp.description.split('\n').map((line, i) => line && <li key={i}>{line.replace(/^- /, '')}</li>)}
              </ul>
            </div>
          ))}
        </ResumeSection>

        <ResumeSection title="Education & Certifications">
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-2">
               <div className="flex justify-between">
                <h3 className="font-bold">{edu.institution}</h3>
                <p className="italic">{edu.dates}</p>
              </div>
              <p className="italic">{edu.degree}</p>
            </div>
          ))}
          {data.highlights && <p className="mt-2">{data.highlights}</p>}
        </ResumeSection>
        
        <div className="grid grid-cols-2 gap-x-8">
          <div>
            <ResumeSection title="Key Skills">
              <ul className="list-disc list-inside">
                {data.skills.map((skill, i) => <li key={i}>{skill}</li>)}
              </ul>
            </ResumeSection>
          </div>
          <div>
            <ResumeSection title="Technical Tools">
               <ul className="list-disc list-inside">
                {data.tools.map((tool, i) => <li key={i}>{tool}</li>)}
              </ul>
            </ResumeSection>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-x-8">
            <div>
              <ResumeSection title="Languages">
                <ul className="list-disc list-inside">
                  {data.languages.map((lang, i) => <li key={i}>{lang}</li>)}
                </ul>
              </ResumeSection>
            </div>
            <div>
               <ResumeSection title="Links">
                  <ul>
                    {data.links.map((link, i) => (
                      <li key={i}>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{link.label}</a>
                      </li>
                    ))}
                  </ul>
              </ResumeSection>
            </div>
        </div>

      </div>
    </div>
  );
});

ResumePreview.displayName = 'ResumePreview';
