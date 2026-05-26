import Nav from "@/components/brand/nav";
import Hero from "@/components/brand/hero";
import Story from "@/components/brand/story";
import PullQuote from "@/components/brand/pull-quote";
import HowIWork from "@/components/brand/how-i-work";
import Projects from "@/components/brand/projects";
import Services from "@/components/brand/services";
import Writing from "@/components/brand/writing";
import Now from "@/components/brand/now";
import Newsletter from "@/components/brand/newsletter";
import Proof from "@/components/brand/proof";
import Contact from "@/components/brand/contact";
import Footer from "@/components/brand/footer";
import PageEffects from "@/components/brand/page-effects";
import Section from "@/components/brand/section";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Story />
        <PullQuote />
        <HowIWork />
        <Projects />
        <Services />
        <Writing />
        <Proof />
        <Now />
        <Section id="subscribe" bleed divider>
          <Newsletter />
        </Section>
        <Contact />
      </main>
      <Footer />
      <PageEffects />
    </>
  );
}
