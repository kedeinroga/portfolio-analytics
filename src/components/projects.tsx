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
    id: 'medical-appointment-scheduling',
    tags: ['Typescript', 'Serverless Framework', 'Jest', 'Lambda', 'DynamoDB', 'API Gateway', 'SNS', 'SQS', 'EventBridge', 'RDS', 'GitHub Actions', 'Hexagonal/Clean Architecture'],
    githubUrl: 'https://github.com/kedeinroga/medical-appointment-scheduling',
    liveUrl: null,
  },
  {
    id: 'bank-cli',
    tags: ['Typescript', 'Jest', 'CLI'],
    githubUrl: 'https://github.com/kedeinroga/bank-cli',
    liveUrl: null,
  },
  {
    id: 'portfolio-stock',
    tags: ['Node', 'Typescript'],
    githubUrl: 'https://github.com/kedeinroga/portfolio-stock',
    liveUrl: null,
  },
  {
    id: 'challenge-poke',
    tags: ['Python', 'Pytest', 'PokéAPI'],
    githubUrl: 'https://github.com/kedeinroga/challenge-poke',
    liveUrl: null,
  },
  {
    id: 'get-that-home',
    tags: ['React', 'Styled Components', 'GraphQL', 'Apollo Client', 'Ruby on Rails'],
    githubUrl: 'https://github.com/kedeinroga/get-that-home',
    liveUrl: null,
  },
  {
    id: 'econuni-2016',
    tags: ['PHP', 'CodeIgniter', 'HTML', 'CSS', 'MVC'],
    githubUrl: 'https://github.com/kedeinroga/econuni-2016',
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
