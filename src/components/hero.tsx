'use client';
import Image from 'next/image';
import { Button } from './ui/button';
import { Github, Linkedin, Download } from 'lucide-react';
import { FadeIn } from './fade-in';
import { useI18n } from '@/context/i18n';
import { logCvDownload } from '@/lib/analytics';
import { cn } from '@/lib/utils';

export function Hero() {
  const { t } = useI18n();

  const handleDownload = () => {
    logCvDownload();
  };

  return (
    <section className="py-20 text-center md:py-32">
      <FadeIn>
        <Image
          src="/avatar.png"
          alt={t('hero.alt')}
          width={200}
          height={200}
          className="mx-auto mb-6 rounded-full"
          priority
        />
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Kedein Rodriguez Gatica
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          {t('hero.subtitle')}
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            asChild
            className="w-10 px-0 sm:w-auto sm:px-4"
          >
            <a
              href="https://www.linkedin.com/in/kedein-rodriguez-gatica/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin className="h-4 w-4" />
              <span className="hidden sm:ml-2 sm:inline">LinkedIn</span>
            </a>
          </Button>
          <Button
            variant="outline"
            asChild
            className="w-10 px-0 sm:w-auto sm:px-4"
          >
            <a
              href="https://github.com/kedeinroga"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:ml-2 sm:inline">GitHub</span>
            </a>
          </Button>
          <Button
            variant="outline"
            asChild
            className={cn(
              'md:hidden',
              'w-10 px-0 sm:w-auto sm:px-4' // Hidden on medium screens and up
            )}
          >
            <a
              href={t('header.cvFile')}
              download
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:ml-2 sm:inline">
                {t('header.downloadCV')}
              </span>
            </a>
          </Button>
        </div>
      </FadeIn>
    </section>
  );
}
