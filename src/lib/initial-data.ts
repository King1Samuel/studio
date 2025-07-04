import type { ResumeData } from './types';

export const initialData: ResumeData = {
  name: 'Alex Doe',
  title: 'Senior Cybersecurity Analyst',
  contact: {
    email: 'alex.doe@email.com',
    phone: '(123) 456-7890',
    linkedin: 'linkedin.com/in/alexdoe',
    github: 'github.com/alexdoe',
  },
  professionalSummary:
    'Highly skilled and motivated Senior Cybersecurity Analyst with over 10 years of experience in protecting sensitive data and systems. Proven expertise in threat detection, incident response, and vulnerability management. Adept at developing and implementing robust security protocols and leading security awareness training programs.',
  workExperience: [
    {
      id: 'work1',
      role: 'Senior Cybersecurity Analyst',
      company: 'SecureNet Corp',
      dates: 'Jan 2018 - Present',
      description:
        '- Led a team of analysts in monitoring network traffic and identifying potential security breaches.\n- Developed and implemented new incident response protocols, reducing response time by 30%.\n- Conducted regular vulnerability assessments and penetration testing to identify and mitigate security risks.',
    },
    {
      id: 'work2',
      role: 'Cybersecurity Specialist',
      company: 'DataProtect Inc.',
      dates: 'Jun 2014 - Dec 2017',
      description:
        '- Monitored security alerts and responded to security incidents.\n- Assisted in the development of security policies and procedures.\n- Provided security awareness training to employees.',
    },
  ],
  education: [
    {
      id: 'edu1',
      institution: 'State University',
      degree: 'M.S. in Cybersecurity',
      dates: '2012 - 2014',
    },
    {
      id: 'edu2',
      institution: 'Tech Institute',
      degree: 'B.S. in Computer Science',
      dates: '2008 - 2012',
    },
  ],
  skills: [
    'Threat Detection & Analysis',
    'Incident Response',
    'Vulnerability Management',
    'Penetration Testing',
    'SIEM',
    'Firewall Configuration',
    'Cryptography',
  ],
  tools: ['Wireshark', 'Nmap', 'Metasploit', 'Splunk', 'Nessus'],
  languages: ['English (Native)', 'Spanish (Professional)'],
  highlights:
    'CISSP, Certified Ethical Hacker (CEH)',
  links: [
    {
      label: 'CISSP Certification',
      url: 'https://example.com/cissp',
    },
  ],
};
