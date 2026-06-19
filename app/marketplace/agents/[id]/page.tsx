import { ServiceDetailView } from "@/components/marketplace/service-detail-view";

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  return <ServiceDetailView serviceId={params.id} />;
}
