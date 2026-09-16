'use client';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CalendarCheck, TrendingDown } from 'lucide-react';
import { FadeIn } from './fade-in';
import { useI18n } from '@/context/i18n';
import { logToolOpen } from '@/lib/analytics';

const toolsData = [
  {
    id: 'finanzas',
    href: '/finanzas',
    Icon: TrendingDown,
  },
  {
    id: 'calculadora',
    href: '/calculadora',
    Icon: CalendarCheck,
  },
];

export function Tools() {
  const { t } = useI18n();

  const tools = toolsData.map(tool => ({
    ...tool,
    title: t(`tools.${tool.id}.title`),
    description: t(`tools.${tool.id}.description`),
  }));

  return (
    <FadeIn>
      <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {t('tools.title')}
      </h2>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        {t('tools.subtitle')}
      </p>
      <div className="mt-10 grid gap-8 sm:grid-cols-1 md:grid-cols-2">
        {tools.map(({ id, href, Icon, title, description }) => (
          <Card key={id} className="flex flex-col">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow" />
            <CardFooter>
              <Button size="sm" asChild>
                <Link href={href} onClick={() => logToolOpen(id)}>
                  {t('tools.open')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </FadeIn>
  );
}
