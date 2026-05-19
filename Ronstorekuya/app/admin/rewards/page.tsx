import { SiteShell } from "@/components/site-shell";
import type { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";
import { formatPoints } from "@/lib/utils";

type RewardRow = Database["public"]["Tables"]["rewards"]["Row"];

export default async function AdminRewardsPage() {
  const supabase = await createClient();
  const { data: rewardsData } = await supabase
    .from("rewards")
    .select("id, title, description, image_emoji, points_cost, stock, is_active, created_at, updated_at")
    .order("created_at", { ascending: false });

  const rewards: RewardRow[] = rewardsData ?? [];

  return (
    <SiteShell
      admin
      title="Rewards Management"
      subtitle="Add, edit, at i-control dito ang reward items na pwede i-claim ng customers."
    >
      <section className="table-card" style={{ marginBottom: 18 }}>
        <span className="eyebrow">Create Reward</span>
        <h2>New reward item</h2>
        <form action="/api/admin/rewards" method="post" className="field-grid two">
          <label>
            Reward Title
            <input name="title" placeholder="Free Softdrinks" required />
          </label>
          <label>
            Points Cost
            <input min="1" name="pointsCost" type="number" required />
          </label>
          <label>
            Emoji/Icon
            <input name="imageEmoji" placeholder="🥤" required />
          </label>
          <label>
            Stock
            <input name="stock" placeholder="Leave blank for unlimited" type="number" />
          </label>
          <label style={{ gridColumn: "1 / -1" }}>
            Description
            <textarea name="description" placeholder="I-describe ang reward item" rows={4} required />
          </label>
          <button className="primary-button" type="submit">
            Add reward
          </button>
        </form>
      </section>

      <section className="table-card">
        <span className="eyebrow">Existing Rewards</span>
        <h2>Catalog overview</h2>
        <div className="stack">
          {rewards?.map((reward) => (
            <form action="/api/admin/rewards" className="reward-card" key={reward.id} method="post">
              <input type="hidden" name="id" value={reward.id} />
              <div className="field-grid two">
                <label>
                  Title
                  <input defaultValue={reward.title} name="title" required />
                </label>
                <label>
                  Points Cost
                  <input defaultValue={reward.points_cost} min="1" name="pointsCost" type="number" required />
                </label>
                <label>
                  Emoji/Icon
                  <input defaultValue={reward.image_emoji} name="imageEmoji" required />
                </label>
                <label>
                  Stock
                  <input defaultValue={reward.stock ?? ""} name="stock" type="number" />
                </label>
                <label style={{ gridColumn: "1 / -1" }}>
                  Description
                  <textarea defaultValue={reward.description} name="description" rows={3} required />
                </label>
              </div>

              <div className="hero-actions">
                <span className="badge">{formatPoints(reward.points_cost)} pts</span>
                <span className="badge">{reward.is_active ? "Active" : "Inactive"}</span>
              </div>

              <div className="hero-actions">
                <button className="primary-button" name="intent" value="update" type="submit">
                  Save changes
                </button>
                <button className="ghost-button" name="intent" value="toggle" type="submit">
                  {reward.is_active ? "Set inactive" : "Set active"}
                </button>
              </div>
            </form>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
