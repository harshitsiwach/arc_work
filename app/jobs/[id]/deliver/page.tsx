import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchJobPageData } from "@/features/jobs/components/job-data-fetcher";
import { DeliverPageContent } from "./content";

export default async function DeliverPage({ params }: { params: { id: string } }) {
  const data = await fetchJobPageData(params.id);
  if (!data) notFound();
  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <Link href={`/jobs/${params.id}`} className="text-sm hover:underline" style={{ color: "var(--color-fg-muted)" }}>&larr; Back to Job</Link>
        <span className="text-xs" style={{ color: "var(--color-fg-muted)" }}>/</span>
        <h1 className="text-lg font-bold" style={{ color: "var(--color-fg)" }}>Submit Work</h1>
      </div>
      <DeliverPageContent job={data.job} />
    </div>
  );
}
