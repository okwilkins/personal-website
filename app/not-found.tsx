import Link from "next/link";

export default function NotFound() {
  return (
    <section className="surface guide px-6 py-20 sm:px-8">
      <p className="eyebrow">404 / Not found</p>
      <h1 className="mt-4 text-3xl font-medium tracking-tight">
        Nothing at this address.
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        This page may have moved, or never existed.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-11 items-center text-sm text-primary underline underline-offset-4"
      >
        Back to home
      </Link>
    </section>
  );
}
