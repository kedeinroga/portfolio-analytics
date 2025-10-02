'use client';
import { Github, Linkedin } from 'lucide-react';
import { Button } from './ui/button';
import { useI18n } from '@/context/i18n';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useI18n();

  return (
    <footer className="mt-auto border-t bg-card">
      <div className="container mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} Kedein Rodriguez Gatica. {t('footer.rights')}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label="GitHub Profile"
          >
            <a
              href="https://github.com/kedeinroga"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label="LinkedIn Profile"
          >
            <a
              href="https://www.linkedin.com/in/kedein-rodriguez-gatica/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </footer>
  );
}
