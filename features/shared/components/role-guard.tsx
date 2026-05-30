"use client";

import { useRole } from "../hooks/use-role";

interface RoleGuardProps {
  walletAddress: string | null | undefined;
  viewer?: React.ReactNode;
  client?: React.ReactNode;
  provider?: React.ReactNode;
}

export function RoleGuard({ walletAddress, viewer, client, provider }: RoleGuardProps) {
  const { role } = useRole(walletAddress);

  if (role === "client" && client) return <>{client}</>;
  if (role === "provider" && provider) return <>{provider}</>;
  if (role === "viewer" && viewer) return <>{viewer}</>;

  return null;
}
