'use client';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from './fade-in';
import { useI18n } from '@/context/i18n';

const skillsList = [
  'HTML',
  'CSS',
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'Express',
  'MongoDB',
  'SQL',
  'Firebase',
  'Git',
  'Tailwind CSS',
  'REST APIs',
  'GraphQL',
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
