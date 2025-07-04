'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AppHeaderProps {
  resumePreviewRef: React.RefObject<HTMLDivElement>;
}

export function AppHeader({ resumePreviewRef }: AppHeaderProps) {
  const handleDownloadPdf = () => {
    const input = resumePreviewRef.current;
    if (input) {
      // Temporarily remove shadow for capture
      const originalShadow = input.style.boxShadow;
      input.style.boxShadow = 'none';

      html2canvas(input, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
      }).then((canvas) => {
        // Restore shadow
        input.style.boxShadow = originalShadow;

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        
        const imgHeight = pdfWidth / ratio;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
        
        pdf.save('resume.pdf');
      });
    }
  };

  const handleDownloadWord = () => {
    const content = resumePreviewRef.current?.innerHTML;
    if (content) {
      const header =
        "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
        "xmlns:w='urn:schemas-microsoft-com:office:word' " +
        "xmlns='http://www.w3.org/TR/REC-html40'>" +
        "<head><meta charset='utf-8'><title>Resume</title><style>body{font-family: 'Times New Roman', serif;}</style></head><body>";
      const footer = '</body></html>';
      const sourceHTML = header + content + footer;

      const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
      const fileDownload = document.createElement('a');
      document.body.appendChild(fileDownload);
      fileDownload.href = source;
      fileDownload.download = 'resume.doc';
      fileDownload.click();
      document.body.removeChild(fileDownload);
    }
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
