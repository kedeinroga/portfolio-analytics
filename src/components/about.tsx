'use client';
import { useI18n } from '@/context/i18n';
import { FadeIn } from './fade-in';

export function About() {
  const { t } = useI18n();
  return (
    <FadeIn>
      <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {t('about.title')}
      </h2>
      <p className="mt-6 text-lg leading-8 text-muted-foreground">
        {t('about.description')}
      </p>
    </FadeIn>
  );
}
