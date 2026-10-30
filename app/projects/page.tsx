import type { Metadata } from "next";
import { BackHomeHeader } from "@/components/site-chrome";
import { ProjectLinks } from "@/components/project-links";
import { githubProjects } from "@/lib/github";

export const metadata: Metadata = {
  description: "My projects in infrastructure, LLM inference and developer tools.",
  alternates: { canonical: "/projects/" },
};

export default async function Projects() {
  const projects = await githubProjects();
  return (
    <>
      <BackHomeHeader href="/#projects" />
      <section className="surface p-6 sm:p-8">
        <h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Projects</h1>
        <p className="mt-5 max-w-lg text-sm leading-[1.75] text-muted-foreground">
          A few things I build and work on.
        </p>
      </section>
      <section className="section surface" aria-label="GitHub projects">
        <ProjectLinks projects={projects} />
      </section>
    </>
  );
}
