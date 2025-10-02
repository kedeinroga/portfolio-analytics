'use client';
import dynamic from 'next/dynamic';
import { Hero } from '@/components/hero';
import { About } from '@/components/about';
import { Skills } from '@/components/skills';
import { Projects } from '@/components/projects';
import { Experience } from '@/components/experience';
import { Contact } from '@/components/contact';
import { Footer } from '@/components/footer';
import { SectionTracker } from '@/components/section-tracker';
import { useI18n } from '@/context/i18n';

const Header = dynamic(() => import('@/components/header').then(mod => mod.Header), { ssr: false });

export default function Home() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Hero />
        <div className="space-y-24 md:space-y-32">
          <SectionTracker sectionName="about" id="about">
            <About />
          </SectionTracker>
          <SectionTracker sectionName="skills" id="skills">
            <Skills />
          </SectionTracker>
          <SectionTracker sectionName="projects" id="projects">
            <Projects />
          </SectionTracker>
          <SectionTracker sectionName="experience" id="experience">
            <Experience />
          </SectionTracker>
          <SectionTracker sectionName="contact" id="contact">
            <Contact />
          </SectionTracker>
        </div>
      </main>
      <Footer />
    </div>
  );
}
