'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Download, Github, Linkedin, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { logEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'Sobre Mí', href: '#about' },
  { name: 'Habilidades', href: '#skills' },
  { name: 'Proyectos', href: '#projects' },
  { name: 'Contacto', href: '#contact' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDownloadCV = () => {
    logEvent('cv_download');
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-background/80 shadow-md backdrop-blur-sm'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">
            KRG
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {link.name}
              </a>
            ))}
            <Button asChild onClick={handleDownloadCV} size="sm">
              <a href="/Kedein-Rodriguez-CV.pdf" download>
                <Download className="mr-2 h-4 w-4" />
                Descargar CV
              </a>
            </Button>
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <nav className="mt-8 flex flex-col gap-6">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.name}>
                      <a
                        href={link.href}
                        className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                      >
                        {link.name}
                      </a>
                    </SheetClose>
                  ))}
                  <Button asChild onClick={handleDownloadCV} className="mt-4">
                    <a href="/Kedein-Rodriguez-CV.pdf" download>
                      <Download className="mr-2 h-4 w-4" />
                      Descargar CV
                    </a>
                  </Button>
                  <div className="mt-8 flex justify-center gap-4 border-t pt-6">
                     <Button variant="ghost" size="icon" asChild>
                        <a href="https://github.com/kedeinroga" target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile"><Github/></a>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                        <a href="https://www.linkedin.com/in/kedein-rodriguez-gatica/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile"><Linkedin/></a>
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
