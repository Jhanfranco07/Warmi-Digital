import { Container } from "@/shared/components/layout/container";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function ArtisanLearningLoading() {
  return (
    <Container className="space-y-8 py-6 md:py-10">
      <div className="space-y-3">
        <Skeleton className="h-4 w-32 bg-[#f0c3cf]" />
        <Skeleton className="h-12 w-full max-w-xl bg-[#eadfe2]" />
        <Skeleton className="h-5 w-full max-w-2xl bg-[#f4e5df]" />
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-32 rounded-full bg-[#ffe3eb]" />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-[#edc9bd] bg-white p-5 shadow-[0_12px_28px_rgba(122,49,0,0.05)]"
          >
            <Skeleton className="h-10 w-10 rounded-full bg-[#ffe3eb]" />
            <Skeleton className="mt-5 h-7 w-3/4 bg-[#eadfe2]" />
            <Skeleton className="mt-3 h-4 w-full bg-[#f4e5df]" />
            <Skeleton className="mt-2 h-4 w-2/3 bg-[#f4e5df]" />
            <Skeleton className="mt-5 h-2 w-full bg-[#eadfe2]" />
          </div>
        ))}
      </div>
    </Container>
  );
}
