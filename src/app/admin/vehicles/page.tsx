import type { Metadata } from "next";
import { VehiclesManager } from "@/components/admin/VehiclesManager";
import { listVehiclesAdmin } from "@/app/admin/vehicles/actions";

export const metadata: Metadata = {
  title: "Araçlar",
  robots: { index: false, follow: false },
};

export default async function AdminVehiclesPage() {
  const result = await listVehiclesAdmin();
  return (
    <VehiclesManager
      initialRows={result.data ?? []}
      listError={result.ok ? null : (result.error ?? "Liste yüklenemedi.")}
    />
  );
}
