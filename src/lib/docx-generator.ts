import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, TabStopType, TabStopPosition } from 'docx';
import type { ResumeData } from './types';

export function generateDocx(data: ResumeData): Document {
  return new Document({
    sections: [{
      children: [
        new Paragraph({ text: data.name, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
        new Paragraph({ text: data.title, alignment: AlignmentType.CENTER, style: "TOC1" }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun(
              [
                data.contact.email,
                data.contact.phone,
                data.contact.linkedin,
                data.contact.github,
              ].filter(Boolean).join(' | ')
            ),
          ],
          spacing: { after: 400 },
        }),

        ...(data.professionalSummary ? [
          new Paragraph({ text: "Professional Summary", heading: HeadingLevel.HEADING_2, border: { bottom: { color: "auto", space: 1, value: "single", size: 6 } } }),
          new Paragraph({ text: data.professionalSummary, spacing: { after: 200 } }),
        ] : []),
        
        ...(data.workExperience?.length > 0 ? [
          new Paragraph({ text: "Work Experience", heading: HeadingLevel.HEADING_2, border: { bottom: { color: "auto", space: 1, value: "single", size: 6 } } }),
          ...data.workExperience.flatMap(exp => [
            new Paragraph({
              children: [
                new TextRun({ text: exp.role, bold: true }),
                new TextRun({ text: `\t${exp.company}` }),
                new TextRun({ text: `\t${exp.dates}` }),
              ],
              tabStops: [
                { type: TabStopType.RIGHT, position: TabStopPosition.MAX },
                { type: TabStopType.CENTER, position: 4680 }
              ]
            }),
            ...exp.description.split('\n').filter(l => l.trim()).map(line => new Paragraph({ text: line.replace(/^- /, ''), bullet: { level: 0 } })),
            new Paragraph({ text: "" }), // spacing
          ]),
        ] : []),

        ...((data.education?.length > 0 || data.highlights) ? [
            new Paragraph({ text: "Education & Certifications", heading: HeadingLevel.HEADING_2, border: { bottom: { color: "auto", space: 1, value: "single", size: 6 } } }),
            ...data.education.map(edu => 
                new Paragraph({
                    children: [
                        new TextRun({ text: edu.degree, bold: true }),
                        new TextRun({ text: `\t${edu.institution}` }),
                        new TextRun({ text: `\t${edu.dates}` }),
                    ],
                    tabStops: [
                        { type: TabStopType.RIGHT, position: TabStopPosition.MAX },
                        { type: TabStopType.CENTER, position: 4680 }
                    ]
                }),
            ),
            ...(data.highlights ? [new Paragraph({ text: data.highlights, spacing: { before: 200 } })] : []),
            new Paragraph({ text: "" }), // spacing
        ] : []),
      ],
    }],
  });
}
