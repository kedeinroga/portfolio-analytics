'use client';
import Image from 'next/image';
import { Button } from './ui/button';
import { Github, Linkedin, Download } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { FadeIn } from './fade-in';
import { useI18n } from '@/context/i18n';
import { logCvDownload } from '@/lib/analytics';

export function Hero() {
  const profileImage = PlaceHolderImages.find((img) => img.id === 'profilePicture');
  const { t } = useI18n();

  const handleDownload = () => {
    logCvDownload();
  };

  return (
    <section className="py-20 text-center md:py-32">
      <FadeIn>
        {profileImage && (
          <Image
            src={profileImage.imageUrl}
            alt={t('hero.alt')}
            width={128}
            height={128}
            className="mx-auto mb-6 rounded-full"
            style={{ width: 'auto', height: 'auto' }}
            data-ai-hint={profileImage.imageHint}
          />
        )}
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Kedein Rodriguez Gatica
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          {t('hero.subtitle')}
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button variant="outline" asChild>
            <a
              href="https://www.linkedin.com/in/kedein-rodriguez-gatica/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin className="mr-2 h-4 w-4" />
              LinkedIn
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a
              href="https://github.com/kedeinroga"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a
              href={t('header.cvFile')}
              download
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              {t('header.downloadCV')}
            </a>
          </Button>
        </div>
      </FadeIn>
    </section>
  );
}
