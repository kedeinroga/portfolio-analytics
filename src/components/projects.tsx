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

const projects = [
  {
    id: 'eccomerce-tenis',
    title: 'E-commerce de Zapatillas',
    description:
      'Una tienda online de zapatillas con funcionalidades de catálogo, carrito de compras y gestión de estado con Context API.',
    tags: ['React', 'Tailwind CSS', 'Context API'],
    githubUrl: 'https://github.com/kedeinroga/Eccomerce-Tenis',
    liveUrl: null,
  },
  {
    id: 'app-clima',
    title: 'App del Clima',
    description:
      'Aplicación que muestra el pronóstico del tiempo actual de cualquier ciudad del mundo, consumiendo datos de una API externa.',
    tags: ['React', 'API Rest'],
    githubUrl: 'https://github.com/kedeinroga/App-Clima',
    liveUrl: null,
  },
  {
    id: 'citas-veterinaria',
    title: 'Gestor de Citas Veterinarias',
    description:
      'Herramienta para administrar citas de pacientes en una clínica veterinaria, utilizando Local Storage para persistencia de datos.',
    tags: ['React', 'Local Storage', 'Vite'],
    githubUrl: 'https://github.com/kedeinroga/Citas-Veterinaria',
    liveUrl: null,
  },
  {
    id: 'cotizador-criptos',
    title: 'Cotizador de Criptomonedas',
    description:
      'Aplicación para consultar en tiempo real el valor de diferentes criptomonedas en varias divisas.',
    tags: ['React', 'Styled Components', 'API Rest'],
    githubUrl: 'https://github.com/kedeinroga/cotizador-criptos',
    liveUrl: null,
  },
];

export function Projects() {
  return (
    <FadeIn>
      <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Proyectos
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
                    Código
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
                      Demo
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
