import { FadeIn } from './fade-in';

export function About() {
  return (
    <FadeIn>
      <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Sobre Mí
      </h2>
      <p className="mt-6 text-lg leading-8 text-muted-foreground">
        Soy un apasionado desarrollador web full stack con experiencia en la
        creación de aplicaciones web modernas y escalables. Me encanta aprender
        nuevas tecnologías y aplicarlas para resolver problemas del mundo real.
        Mi objetivo es construir productos que no solo sean funcionales, sino
        que también ofrezcan una excelente experiencia de usuario.
      </p>
    </FadeIn>
  );
}
