'use client';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Github, ExternalLink } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { FadeIn } from './fade-in';
import { useI18n } from '@/context/i18n';

const projectsData = [
  {
    id: 'eccomerce-tenis',
    tags: ['React', 'Tailwind CSS', 'Context API'],
    githubUrl: 'https://github.com/kedeinroga/Eccomerce-Tenis',
    liveUrl: null,
  },
  {
    id: 'app-clima',
    tags: ['React', 'API Rest'],
    githubUrl: 'https://github.com/kedeinroga/App-Clima',
    liveUrl: null,
  },
  {
    id: 'citas-veterinaria',
    tags: ['React', 'Local Storage', 'Vite'],
    githubUrl: 'https://github.com/kedeinroga/Citas-Veterinaria',
    liveUrl: null,
  },
  {
    id: 'cotizador-criptos',
    tags: ['React', 'Styled Components', 'API Rest'],
    githubUrl: 'https://github.com/kedeinroga/cotizador-criptos',
    liveUrl: null,
  },
];

export function Projects() {
  const { t } = useI18n();

  const projects = projectsData.map(project => ({
    ...project,
    title: t(`projects.${project.id}.title`),
    description: t(`projects.${project.id}.description`),
  }));

  return (
    <FadeIn>
      <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {t('projects.title')}
      </h2>
      <div className="mt-10 grid gap-8 sm:grid-cols-1 md:grid-cols-2">
        {projects.map((project) => {
          const projectImage = PlaceHolderImages.find(
            (img) => img.id === project.id
          );
          return (
            <Card key={project.id} className="flex flex-col">
              {projectImage && (
                <div className="relative h-48 w-full">
                  <Image
                    src={projectImage.imageUrl}
                    alt={project.title}
                    fill
                    className="rounded-t-lg object-cover"
                    data-ai-hint={projectImage.imageHint}
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    {t('projects.code')}
                  </a>
                </Button>
                {project.liveUrl && (
                  <Button size="sm" asChild>
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {t('projects.demo')}
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </FadeIn>
  );
}
