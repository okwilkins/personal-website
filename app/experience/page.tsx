import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { BackHomeHeader } from "@/components/site-chrome";
import { Speaking } from "@/components/speaking";
import { education, experience, skills } from "@/data/site";

export const metadata: Metadata = {
  description:
    "My work in LLM inference, AI infrastructure, and data science, from freelance projects to building and running GPU platforms on Kubernetes.",
  alternates: { canonical: "/experience/" },
};

export default function Experience() {
  return (
    <>
      <BackHomeHeader href="/#experience" />
      <section className="surface p-6 sm:p-8">
        <h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
          Experience
        </h1>
        <p className="mt-5 max-w-lg text-sm leading-[1.75] text-muted-foreground">
          I’ve worked across data science, applied AI, and the infrastructure
          behind it. Today, I build and run LLM inference platforms on Kubernetes.
        </p>
        <ul aria-label="Skills" className="mt-5 flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <li key={skill}>
              <Badge
                variant="outline"
                className="rounded-sm px-1.5 py-0.5 font-mono text-[11px] font-normal text-muted-foreground/75"
              >
                {skill}
              </Badge>
            </li>
          ))}
        </ul>
      </section>

      <ol aria-label="Professional experience">
        {experience.map((item) => (
          <li key={item.company} className="section surface">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 className="text-base font-semibold tracking-tight sm:text-[17px]">
                {item.company}
              </h2>
              <span className="font-mono text-[11px] text-muted-foreground/75">
                {item.period}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{item.title}</p>
            <ul className="mt-4 list-disc space-y-2 pl-4 text-sm leading-[1.75] text-muted-foreground marker:text-muted-foreground/50">
              {item.highlights.map((highlight) => (
                <li key={highlight} className="pl-1">
                  {highlight}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <section className="section surface" aria-labelledby="education-heading">
        <div className="section-title">
          <h2 id="education-heading">Education</h2>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="text-sm font-medium">{education.institution}</h3>
          <span className="font-mono text-[11px] text-muted-foreground/75">
            {education.period}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{education.degree}</p>
      </section>
      <Speaking />
    </>
  );
}
