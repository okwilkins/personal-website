import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyEmail } from "@/components/copy-email";
import { socialIcons } from "@/components/social-icons";
import { ServiceLinks } from "@/components/service-links";
import { ProjectLinks } from "@/components/project-links";
import { SectionNav } from "@/components/section-nav";
import { experience, site, socials } from "@/data/site";
import { githubProjects } from "@/lib/github";
import { publicServices } from "@/lib/homelab";

export default async function Home() {
  const recentExperience = experience.slice(0, 3);
  const [selectedProjects, services] = await Promise.all([
    githubProjects(),
    publicServices(),
  ]);
  return (
    <>
      <header id="site-header" className="surface guide sticky top-0 z-30 px-6 sm:px-8">
        <div className="flex flex-wrap items-center gap-x-3 font-mono text-[11px] text-muted-foreground sm:gap-x-6">
          <Link href="/" aria-label="Oli Wilkins — home" className="order-1 inline-flex min-h-11 min-w-11 items-center">
            <span aria-hidden="true" className="font-mono text-lg font-semibold tracking-[-0.12em]">
              ow<span className="text-primary">_</span>
            </span>
          </Link>
          <SectionNav hasServices={services.length > 0} />
          <div
            className="order-2 -mr-3 ml-auto flex shrink-0 items-center sm:order-3"
            aria-label="Social links"
          >
            {socials.map((social) => {
              const Icon = socialIcons[social.icon];
              return (
                <Button
                  key={social.label}
                  variant="ghost"
                  size="icon"
                  asChild
                  className="size-11 text-muted-foreground hover:bg-transparent hover:text-foreground dark:hover:bg-transparent"
                >
                  <a
                    href={social.href}
                    aria-label={social.label}
                    title={social.label}
                    target="_blank"
                    rel="me noopener noreferrer"
                  >
                    <Icon aria-hidden="true" className="size-4 sm:size-4.5" />
                  </a>
                </Button>
              );
            })}
            <CopyEmail email={site.email} />
          </div>
        </div>
      </header>
      <section
        className="surface p-6 sm:p-8"
        aria-labelledby="profile-heading"
      >
        <h1
          id="profile-heading"
          className="text-[2.75rem] leading-tight font-semibold tracking-[-0.065em] sm:text-[3.5rem]"
        >
          {site.name}
        </h1>
        <p className="mt-2 text-base tracking-[-0.02em] text-primary sm:text-lg">
          {site.role}
        </p>
        <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          {site.intro}
          <br />
          {site.tagline}
        </p>
      </section>

      <section
        id="experience"
        className="section surface"
        aria-labelledby="experience-heading"
      >
        <div className="section-title mb-0">
          <h2 id="experience-heading">Experience</h2>
        </div>
        <div className="section-preview -ml-1 pl-1">
          <ol className="ml-1.5 border-l">
            {recentExperience.map((item, index) => (
              <li
                key={item.company}
                className={`relative py-5 pl-6 ${index === 2 ? "preview-peek" : ""}`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute top-6.5 -left-[4.5px] size-2 rounded-full ring-4 ring-background ${index === 0 ? "bg-primary" : "bg-muted-foreground/50"}`}
                />
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h3 className="text-[15px] font-semibold tracking-[-0.015em] sm:text-base">
                    {item.company}
                  </h3>
                  <span className="font-mono text-[11px] text-muted-foreground sm:ml-auto">
                    {item.period}
                  </span>
                </div>
                <p className="mt-2 text-[13px] text-muted-foreground">
                  {item.title}
                </p>
                <p className="mt-2 max-w-[37rem] text-sm leading-[1.75] text-muted-foreground">
                  {item.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
        <Link
          href="/experience/"
          transitionTypes={["page-reveal"]}
          className="group relative mx-auto mt-2 flex min-h-11 w-fit items-center justify-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground active:text-foreground"
        >
          Full experience
          <ArrowRight aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" />
        </Link>
      </section>

      <section
        id="projects"
        className="section surface"
        aria-labelledby="projects-heading"
      >
        <div className="section-title mb-0">
          <h2 id="projects-heading">Projects</h2>
        </div>
        <ProjectLinks projects={selectedProjects} preview />
        <Link
          href="/projects/"
          transitionTypes={["page-reveal"]}
          className="group relative mx-auto mt-2 flex min-h-11 w-fit items-center justify-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground active:text-foreground"
        >
          All projects
          <ArrowRight aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" />
        </Link>
      </section>
      {services.length > 0 && (
        <section id="services" className="section surface" aria-labelledby="services-heading">
          <div className="section-title mb-3">
            <h2 id="services-heading">Services</h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            A few things I host on my Kubernetes homelab.
          </p>
          <ServiceLinks services={services} preview />
          <Link
            href="/services/"
            transitionTypes={["page-reveal"]}
            className="group relative mx-auto mt-2 flex min-h-11 w-fit items-center justify-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground active:text-foreground"
          >
            All services
            <ArrowRight aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" />
          </Link>
        </section>
      )}
    </>
  );
}
