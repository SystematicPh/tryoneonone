import { SiteShell } from "@/components/site-shell";
import type { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

type PointSettingsRow = Database["public"]["Tables"]["point_settings"]["Row"];

export default async function AdminPointsPage() {
  const supabase = await createClient();
  const { data: settingsData } = await supabase
    .from("point_settings")
    .select("id, amount_per_point, points_per_amount, created_at, updated_at")
    .eq("id", 1)
    .single();

  const settings: PointSettingsRow | null = settingsData ?? null;

  return (
    <SiteShell
      admin
      title="Points Management"
      subtitle="Baguhin dito ang conversion logic ng purchases papuntang reward points."
    >
      <section className="panel-grid two">
        <div className="content-card">
          <span className="eyebrow">Current Rule</span>
          <h2>
            PHP {settings?.amount_per_point} = {settings?.points_per_amount} point(s)
          </h2>
          <p>
            Example: kapag 100 PHP = 1 point, every encoded purchase ay hahatiin sa current amount rule para ma-compute
            ang points awarded.
          </p>
        </div>

        <div className="table-card">
          <span className="eyebrow">Update Rule</span>
          <h2>Edit conversion</h2>
          <form action="/api/admin/points-settings" method="post" className="stack">
            <label>
              Amount per point in PHP
              <input
                defaultValue={settings?.amount_per_point ?? 100}
                min="1"
                name="amountPerPoint"
                step="0.01"
                type="number"
                required
              />
            </label>
            <label>
              Points per amount
              <input
                defaultValue={settings?.points_per_amount ?? 1}
                min="0.01"
                name="pointsPerAmount"
                step="0.01"
                type="number"
                required
              />
            </label>
            <button className="primary-button" type="submit">
              Save points rule
            </button>
          </form>
        </div>
      </section>
    </SiteShell>
  );
}
