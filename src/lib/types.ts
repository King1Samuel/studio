export interface WorkExperience {
  id: string;
  role: string;
  company: string;
  dates: string;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  dates: string;
}

export interface ResumeData {
  name: string;
  title: string;
  contact: {
    email: string;
    phone: string;
    linkedin: string;
    github: string;
  };
  professionalSummary: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: string[];
  tools: string[];
  languages: string[];
  highlights: string;
  links: {
    label: string;
    url: string;
  }[];
}
