
'use client';
import { useI18n } from '@/context/i18n';
import { FadeIn } from './fade-in';
import { Briefcase, Award } from 'lucide-react';

interface Job {
  company: string;
  role: string;
  dates: string;
  description: string[];
  awards?: string[];
}

export function Experience() {
  const { t } = useI18n();

  // Helper function to get jobs from translations
  const getJobs = (): Job[] => {
    const jobsData: any = t('experience.jobs');
    if (Array.isArray(jobsData)) {
      return jobsData;
    }
    // Handle cases where the translation might not be an array
    // This could happen during initial load or if translations are missing
    // We try to parse it from a string if possible.
    try {
      const parsed = JSON.parse(jobsData);
      if(Array.isArray(parsed)) return parsed;
    } catch(e) {
      // ignore
    }
    return [];
  }

  const jobs = getJobs();


  return (
    <FadeIn>
      <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {t('experience.title')}
      </h2>
      <div className="relative mt-10 pl-6 after:absolute after:inset-y-0 after:left-6 after:w-px after:bg-border">
        {jobs.map((job, index) => (
          <div key={index} className="relative mb-12 grid grid-cols-[auto_1fr] items-start gap-x-6">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-card ring-8 ring-background">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div className="pt-1.5">
              <h3 className="text-xl font-semibold text-foreground">{job.role}</h3>
              <p className="text-md font-medium text-muted-foreground">{job.company}</p>
              <p className="mb-4 text-sm text-muted-foreground">{job.dates}</p>
              <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                {job.description.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
              {job.awards && job.awards.length > 0 && (
                <div className="mt-4">
                  {job.awards.map((award, i) => (
                     <div key={i} className="mt-2 flex items-start gap-2 rounded-md border bg-secondary/50 p-3 text-sm">
                       <Award className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                       <span>{award}</span>
                     </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </FadeIn>
  );
}
