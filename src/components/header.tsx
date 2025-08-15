'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import type { ResumeData } from '@/lib/types';
import { initialData } from '@/lib/initial-data';


interface AppHeaderProps {
  resumePreviewRef: React.RefObject<HTMLDivElement>;
  resumeData: ResumeData
}

export function AppHeader({ resumePreviewRef, resumeData }: AppHeaderProps) {

  const handleDownloadPdf = () => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const addText = (text: string, options: any, isSplit = true) => {
        if (y + (options.fontSize || 10) > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }
        doc.setFont(options.font || 'times', options.fontStyle || 'normal');
        doc.setFontSize(options.fontSize || 10);
        doc.setTextColor(options.color || '#333333');
        const lines = isSplit ? doc.splitTextToSize(text, contentWidth) : [text];
        doc.text(lines, options.x, y);
        y += (lines.length * (options.fontSize || 10)) + (options.spacing || 0);
    };

    const addSectionHeader = (title: string) => {
        y += 10;
        addText(title, { x: margin, fontSize: 14, fontStyle: 'bold', spacing: 2 });
        doc.setDrawColor('#BBBBBB');
        doc.line(margin, y - 2, pageWidth - margin, y - 2);
        y += 8;
    };
    
    // --- Header ---
    doc.setFont('times', 'bold');
    doc.setFontSize(28);
    doc.text(resumeData.name, pageWidth / 2, y, { align: 'center' });
    y += 28;

    doc.setFont('times', 'normal');
    doc.setFontSize(14);
    doc.text(resumeData.title, pageWidth / 2, y, { align: 'center' });
    y += 14;

    const contactInfo = [
        resumeData.contact.email,
        resumeData.contact.phone,
        resumeData.contact.linkedin,
        resumeData.contact.github
    ].filter(Boolean).join('  |  ');
    doc.setFontSize(10);
    doc.setTextColor('#555555')
    doc.text(contactInfo, pageWidth / 2, y, { align: 'center' });
    y += 20;


    // --- Sections ---
    if (resumeData.professionalSummary) {
        addSectionHeader('Professional Summary');
        addText(resumeData.professionalSummary, { x: margin, fontSize: 11, spacing: 5 });
    }
    
    if (resumeData.workExperience?.length > 0) {
        addSectionHeader('Work Experience');
        resumeData.workExperience.forEach(exp => {
            addText(exp.role, { x: margin, fontSize: 11, fontStyle: 'bold' });
            y += 2;
            doc.setFont('times', 'italic');
            doc.text(exp.company, margin, y);
            doc.text(exp.dates, pageWidth - margin, y, { align: 'right' });
            y += 11;
            
            const descLines = exp.description.split('\n').filter(line => line.trim());
             descLines.forEach(line => {
                addText(`\u2022 ${line.replace(/^- /, '')}`, { x: margin + 10, fontSize: 11, spacing: 2 });
            });
            y += 10;
        });
    }

     if (resumeData.education?.length > 0 || resumeData.highlights) {
        addSectionHeader('Education & Certifications');
        resumeData.education.forEach(edu => {
            addText(edu.institution, { x: margin, fontSize: 11, fontStyle: 'bold' });
             y += 2;
            doc.setFont('times', 'italic');
            doc.text(edu.degree, margin, y);
            doc.text(edu.dates, pageWidth - margin, y, { align: 'right' });
            y += 18;
        });
        if(resumeData.highlights) {
            addText(resumeData.highlights, { x: margin, fontSize: 11 });
        }
    }
    
    // Multi-column section
    const startYMultiCol = y;
    let yCol1 = startYMultiCol;
    let yCol2 = startYMultiCol;
    const colWidth = contentWidth / 2 - 10;

    const addColText = (col: number, text: string, options: any) => {
        let currentY = col === 1 ? yCol1 : yCol2;
        const xPos = col === 1 ? margin : margin + contentWidth / 2 + 10;
        
        if (currentY + (options.fontSize || 10) > pageHeight - margin) {
            // This basic implementation doesn't handle page breaks within columns perfectly
            // For a more robust solution, a more complex layout engine would be needed.
        }
        
        doc.setFont(options.font || 'times', options.fontStyle || 'normal');
        doc.setFontSize(options.fontSize || 10);
        const lines = doc.splitTextToSize(text, colWidth);
        doc.text(lines, xPos, currentY);
        
        const height = (lines.length * (options.fontSize || 10)) + (options.spacing || 0);
        if (col === 1) yCol1 += height;
        else yCol2 += height;
    }

    const hasSkillsOrTools = resumeData.skills?.length > 0 || resumeData.tools?.length > 0;
    const hasLangsOrLinks = resumeData.languages?.length > 0 || resumeData.links?.length > 0;

    if(hasSkillsOrTools) {
        y += 10; // add some top margin
        yCol1 = y;
        yCol2 = y;

        if (resumeData.skills?.length > 0) {
            addColText(1, 'Key Skills', { fontSize: 12, fontStyle: 'bold', spacing: 8 });
            resumeData.skills.forEach(skill => {
                addColText(1, `\u2022 ${skill}`, { fontSize: 11, spacing: 4 });
            });
        }
        if (resumeData.tools?.length > 0) {
             addColText(2, 'Technical Tools', { fontSize: 12, fontStyle: 'bold', spacing: 8 });
            resumeData.tools.forEach(tool => {
                addColText(2, `\u2022 ${tool}`, { fontSize: 11, spacing: 4 });
            });
        }
    }
    
    y = Math.max(yCol1, yCol2);
    
    if (hasLangsOrLinks) {
        y += 10;
        yCol1 = y;
        yCol2 = y;
         if (resumeData.languages?.length > 0) {
            addColText(1, 'Languages', { fontSize: 12, fontStyle: 'bold', spacing: 8 });
            resumeData.languages.forEach(lang => {
                addColText(1, `\u2022 ${lang}`, { fontSize: 11, spacing: 4 });
            });
        }
         if (resumeData.links?.length > 0) {
            addColText(2, 'Links', { fontSize: 12, fontStyle: 'bold', spacing: 8 });
            resumeData.links.forEach(link => {
                addColText(2, link.label, { fontSize: 11, spacing: 4, color: '#0000EE' });
                 doc.link(margin + contentWidth / 2 + 10, yCol2 - 11, colWidth, 11, { url: link.url });
            });
        }
    }


    doc.save('resume.pdf');
  };

  const handleDownloadWord = () => {
    const data = resumeData;
    const styles = `
      body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; color: #333; }
      h1, h2, h3, p { margin: 0; }
      h1 { font-size: 28pt; text-align: center; }
      h2 { font-size: 14pt; border-bottom: 1px solid #bbb; padding-bottom: 2px; margin-top: 12px; margin-bottom: 6px; }
      h3 { font-size: 11pt; font-weight: bold; }
      ul { padding-left: 20px; margin-top: 4px; }
      li { margin-bottom: 2px; }
      .header p { text-align: center; }
      .title { font-size: 14pt; text-align: center; margin-bottom: 4px; }
      .contact { font-size: 10pt; text-align: center; color: #555; margin-bottom: 12px; }
      .job { margin-bottom: 12px; }
      .job-title { display: flex; justify-content: space-between; }
      .job-company { font-style: italic; }
      .grid-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    `;

    let content = `
      <div class="header">
        <h1>${data.name}</h1>
        <p class="title">${data.title}</p>
        <p class="contact">${[data.contact.email, data.contact.phone, data.contact.linkedin, data.contact.github].filter(Boolean).join('  |  ')}</p>
      </div>
    `;

    if (data.professionalSummary) {
      content += `<h2>Professional Summary</h2><p>${data.professionalSummary}</p>`;
    }

    if (data.workExperience?.length > 0) {
      content += `<h2>Work Experience</h2>`;
      data.workExperience.forEach(exp => {
        content += `
          <div class="job">
            <div class="job-title">
              <h3>${exp.role}</h3>
              <p>${exp.dates}</p>
            </div>
            <p class="job-company">${exp.company}</p>
            <ul>
              ${exp.description.split('\n').filter(l => l.trim()).map(line => `<li>${line.replace(/^- /, '')}</li>`).join('')}
            </ul>
          </div>
        `;
      });
    }
    
     if (data.education?.length > 0 || data.highlights) {
        content += `<h2>Education & Certifications</h2>`;
        data.education.forEach(edu => {
             content += `<div class="job"><div class="job-title"><p><strong>${edu.institution}</strong></p><p>${edu.dates}</p></div><p><em>${edu.degree}</em></p></div>`;
        });
        if(data.highlights) content += `<p>${data.highlights}</p>`
    }

    content += `<br/><table><tr><td style="vertical-align: top; width: 50%;">`;
    if (data.skills?.length > 0) {
        content += `<h3>Key Skills</h3><ul>${data.skills.map(s => `<li>${s}</li>`).join('')}</ul>`;
    }
    if (data.languages?.length > 0) {
        content += `<h3 style="margin-top: 12px;">Languages</h3><ul>${data.languages.map(l => `<li>${l}</li>`).join('')}</ul>`;
    }
    content += `</td><td style="vertical-align: top; width: 50%;">`;
     if (data.tools?.length > 0) {
        content += `<h3>Technical Tools</h3><ul>${data.tools.map(t => `<li>${t}</li>`).join('')}</ul>`;
    }
    if (data.links?.length > 0) {
        content += `<h3 style="margin-top: 12px;">Links</h3><ul>${data.links.map(l => `<li><a href="${l.url}">${l.label}</a></li>`).join('')}</ul>`;
    }
    content += `</td></tr></table>`;


    const sourceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset='utf-8'>
          <title>Resume</title>
          <style>${styles}</style>
        </head>
        <body>${content}</body>
      </html>
    `;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement('a');
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = 'resume.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <h1 className="text-xl font-bold font-headline">Resum<span className="text-primary/80">AI</span></h1>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
          <Download className="mr-2 h-4 w-4" />
          PDF
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadWord}>
          <Download className="mr-2 h-4 w-4" />
          Word
        </Button>
      </div>
    </header>
  );
}
