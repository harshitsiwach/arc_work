/**
 * Arc Work - Marketplace redirect
 * Redirects to the new jobs listing page
 */

import { redirect } from "next/navigation";

export default function MarketplacePage() {
  redirect("/jobs");
}
