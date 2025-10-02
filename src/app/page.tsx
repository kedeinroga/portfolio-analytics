import { Header } from '@/components/header';
import { Hero } from '@/components/hero';
import { About } from '@/components/about';
import { Skills } from '@/components/skills';
import { Projects } from '@/components/projects';
import { Contact } from '@/components/contact';
import { Footer } from '@/components/footer';
import { SectionTracker } from '@/components/section-tracker';

export default function Home() {
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
          <SectionTracker sectionName="contact" id="contact">
            <Contact />
          </SectionTracker>
        </div>
      </main>
      <Footer />
    </div>
  );
}
