import Link from "next/link";
import type { Route } from "next";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";

const palette = ["#2f62a3", "#b5245b", "#17c3cf", "#f15a24", "#ff8a3d", "#f5b900"];

type ArtisanShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function ArtisanShell({ children, className }: ArtisanShellProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-[#fffaf8] px-4 py-5 pb-24 md:px-8 lg:px-10 lg:py-8 lg:pb-10 xl:px-14 2xl:px-20",
        className
      )}
    >
      <div className="mx-auto w-full max-w-[1760px] space-y-8">{children}</div>
    </div>
  );
}

type ArtisanHeroProps = {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  imageUrl?: string;
};

export function ArtisanHero({
  eyebrow,
  title,
  description,
  actions,
  imageUrl
}: ArtisanHeroProps) {
  return (
    <section className="warmi-scroll-reveal overflow-hidden border border-[#f0c7bb] bg-white shadow-[0_24px_70px_rgba(122,49,0,0.08)]">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-6 md:p-8 xl:p-10">
          <div className="flex flex-wrap items-center gap-2">
            {palette.map((color) => (
              <span
                key={color}
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <p className="mt-7 font-ui text-sm font-extrabold uppercase tracking-[0.08em] text-[#7a3100]">
            {eyebrow}
          </p>
          <h1 className="mt-2 max-w-5xl font-serif text-5xl font-bold leading-[0.95] text-[#1b1c1a] md:text-7xl 2xl:text-8xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-5 max-w-4xl text-lg leading-8 text-[#5b4a42] md:text-xl 2xl:text-2xl">
              {description}
            </p>
          ) : null}
          {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
        </div>

        <div className="relative hidden min-h-[320px] overflow-hidden bg-[#f7e6d8] lg:block">
          {imageUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
              style={{
                backgroundImage: `linear-gradient(to top, rgba(27,28,26,0.22), rgba(255,255,255,0.05)), url(${imageUrl})`
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#fff0f5,#fff8dc_45%,#e8fbfc)]" />
          )}
        </div>
      </div>
    </section>
  );
}

type ArtisanPanelProps = {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
};

export function ArtisanPanel({
  title,
  eyebrow,
  children,
  className,
  action
}: ArtisanPanelProps) {
  return (
    <section
      className={cn(
        "warmi-scroll-reveal overflow-hidden border border-[#f0c7bb] bg-white shadow-[0_20px_54px_rgba(122,49,0,0.07)] transition-all duration-500 hover:shadow-[0_28px_70px_rgba(122,49,0,0.1)]",
        className
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#f4d8cc] bg-[#fffdfb] px-5 py-5 md:px-7">
        <div>
          {eyebrow ? (
            <p className="font-ui text-xs font-extrabold uppercase tracking-[0.08em] text-[#b5245b]">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-1 font-serif text-3xl font-bold text-[#7a3100] md:text-4xl">
            {title}
          </h2>
        </div>
        {action}
      </header>
      <div className="p-5 md:p-7">{children}</div>
    </section>
  );
}

type ArtisanStatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  color?: string;
};

export function ArtisanStatCard({
  title,
  value,
  description,
  icon: Icon,
  color = "bg-[#2f62a3]"
}: ArtisanStatCardProps) {
  return (
    <article className="warmi-scroll-reveal border border-[#f0c7bb] bg-white p-5 shadow-[0_16px_40px_rgba(122,49,0,0.06)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_58px_rgba(122,49,0,0.11)]">
      <span className={cn("inline-flex rounded-full p-3 text-white", color)}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 font-ui text-xs font-extrabold uppercase tracking-[0.08em] text-[#b5245b]">
        {title}
      </p>
      <p className="mt-1 font-serif text-4xl font-bold text-[#1b1c1a] md:text-5xl">
        {value}
      </p>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-[#5b4a42]">{description}</p>
      ) : null}
    </article>
  );
}

type ArtisanActionCardProps = {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color?: string;
};

export function ArtisanActionCard({
  href,
  icon: Icon,
  title,
  description,
  color = "bg-[#f17a2a]"
}: ArtisanActionCardProps) {
  return (
    <Link
      href={href as Route}
      className="warmi-scroll-reveal group border border-[#f0c7bb] bg-white p-5 shadow-[0_14px_36px_rgba(122,49,0,0.06)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_24px_58px_rgba(122,49,0,0.12)]"
    >
      <span
        className={cn(
          "inline-flex rounded-full p-3 text-white transition-transform duration-500 group-hover:scale-110",
          color
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 font-serif text-2xl font-bold text-[#1b1c1a] md:text-3xl">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-[#5b4a42]">{description}</p>
    </Link>
  );
}

export function ArtisanListItem({
  title,
  description,
  meta
}: {
  title: string;
  description?: string;
  meta?: string;
}) {
  return (
    <article className="border border-[#f0c7bb] bg-[#fffdfb] p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-[#fff7f9] hover:shadow-[0_14px_34px_rgba(122,16,66,0.08)]">
      {meta ? (
        <p className="font-ui text-xs font-extrabold uppercase tracking-[0.08em] text-[#b5245b]">
          {meta}
        </p>
      ) : null}
      <h3 className="mt-1 font-ui text-base font-extrabold text-[#1b1c1a]">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-[#5b4a42]">{description}</p>
      ) : null}
    </article>
  );
}
