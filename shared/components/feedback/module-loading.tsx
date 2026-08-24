import { Skeleton } from "@/shared/components/ui/skeleton";

type ModuleLoadingProps = {
  titleWidth?: string;
  cards?: number;
  rows?: number;
};

export function ModuleLoading({
  titleWidth = "w-72",
  cards = 4,
  rows = 4
}: ModuleLoadingProps) {
  return (
    <main className="min-h-screen bg-[#fffaf6] px-5 py-6 lg:px-10 lg:py-10 xl:px-14 2xl:px-20">
      <div className="mx-auto w-full max-w-[1760px] space-y-8">
        <header className="space-y-4">
          <Skeleton className="h-4 w-24 bg-[#f0c3cf]" />
          <Skeleton className={`h-14 ${titleWidth} max-w-full bg-[#eadfe2]`} />
          <Skeleton className="h-5 w-full max-w-2xl bg-[#f4e5df]" />
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: cards }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-36 rounded-[18px] border border-[#ecd0bd] bg-white"
            />
          ))}
        </section>

        <section className="rounded-[20px] border border-[#ecd0bd] bg-white p-5 shadow-[0_18px_42px_rgba(122,49,0,0.06)]">
          <Skeleton className="h-8 w-56 bg-[#eadfe2]" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: rows }).map((_, index) => (
              <Skeleton key={index} className="h-16 rounded-xl bg-[#fff4ee]" />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
