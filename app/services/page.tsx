import type { Metadata } from "next";
import { BackHomeHeader } from "@/components/site-chrome";
import { ServiceLinks } from "@/components/service-links";
import { publicServices } from "@/lib/homelab";

export const metadata: Metadata = {
  description: "Public tools and services I host on my Kubernetes homelab.",
  alternates: { canonical: "/services/" },
};

export default async function Services() {
  const services = await publicServices();
  return (
    <>
      <BackHomeHeader href="/#services" />
      <section className="surface p-6 sm:p-8">
        <h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Services</h1>
        <p className="mt-5 max-w-lg text-sm leading-[1.75] text-muted-foreground">
          Tools and services I host on h8s, my bare-metal Kubernetes homelab.
        </p>
      </section>
      <section className="section surface" aria-label="Public services">
        {services.length ? <ServiceLinks services={services} /> : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            The service list is unavailable right now.{" "}
            <a href="https://github.com/okwilkins/h8s" className="text-link underline underline-offset-4">View h8s on GitHub.</a>
          </p>
        )}
      </section>
    </>
  );
}
