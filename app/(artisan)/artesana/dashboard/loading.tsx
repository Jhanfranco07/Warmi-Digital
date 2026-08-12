import { Skeleton } from "@/shared/components/ui/skeleton";

export default function ArtisanDashboardLoading() {
  return (
    <>
      <section className="bg-[#fff7f9] px-4 pb-6 pt-4 lg:hidden">
        <Skeleton className="h-5 w-44 bg-[#f0c3cf]" />
        <Skeleton className="mt-2 h-3 w-56 bg-[#f4e5df]" />
        <Skeleton className="mt-4 h-9 w-full bg-[#ffe3eb]" />
        <Skeleton className="mt-5 h-28 w-full rounded-lg bg-white" />
        <div className="mt-5 space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-md bg-white" />
          ))}
        </div>
      </section>

      <div className="hidden min-h-screen bg-[#fffaf8] px-8 py-8 lg:block xl:px-12 2xl:px-16">
        <div className="mx-auto w-full max-w-[1680px] space-y-8">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24 bg-[#f0c3cf]" />
            <Skeleton className="h-16 w-full max-w-3xl bg-[#eadfe2]" />
            <Skeleton className="h-5 w-full max-w-2xl bg-[#f4e5df]" />
          </div>

          <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
            <Skeleton className="h-80 rounded-lg bg-white" />
            <Skeleton className="h-80 rounded-lg bg-[#fff8f5]" />
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-14 rounded-lg bg-white" />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-64 rounded-lg bg-white" />
            ))}
          </section>
        </div>
      </div>
    </>
  );
}
