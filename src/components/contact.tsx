'use client';

import { Github, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/context/i18n';

export function Contact() {
  const { t } = useI18n();

  return (
    <section id="contact" className="py-16 sm:py-24">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {t('contact.title')}
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          {t('contact.description')}
        </p>
        <p className="mt-4 text-lg text-muted-foreground">
          {t('contact.availability')}
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <a href="https://github.com/kedeinroga" target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile">
              <Github className="h-8 w-8" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a href="https://www.linkedin.com/in/kedein-rodriguez-gatica/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile">
              <Linkedin className="h-8 w-8" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
