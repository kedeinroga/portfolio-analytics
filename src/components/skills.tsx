'use client';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from './fade-in';
import { useI18n } from '@/context/i18n';

const skillsList = [
  'JavaScript',
  'TypeScript',
  'Python',
  'React',
  'Next.js',
  'Nest.js',
  'MongoDB',
  'SQL',
  'PostgreSQL',
  'Docker',
  'AWS',
  'GCP',
  'Git',
  'Tailwind CSS',
  'REST APIs',
  'GraphQL',
  'First AI',
  'GitFlow',
  'Scrum',
  'Kanban'
];

export function Skills() {
  const { t } = useI18n();
  return (
    <FadeIn>
      <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {t('skills.title')}
      </h2>
      <div className="mt-10 flex flex-wrap gap-3">
        {skillsList.map((skill) => (
          <Badge key={skill} variant="default" className="text-md px-4 py-2">
            {skill}
          </Badge>
        ))}
      </div>
    </FadeIn>
  );
}
