import { SiteShell } from "@/components/site-shell";
import type { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";
import { formatPoints } from "@/lib/utils";

type RewardRow = Database["public"]["Tables"]["rewards"]["Row"];
type RedemptionRow = Database["public"]["Tables"]["reward_redemptions"]["Row"];
type RedemptionListItem = Pick<RedemptionRow, "id" | "points_spent" | "status" | "created_at"> & {
  reward_name_snapshot: string;
};

export default async function RewardsPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: rewardsData }, { data: redemptionsData }] = await Promise.all([
    supabase.from("profiles").select("total_points").eq("id", user!.id).single(),
    supabase
      .from("rewards")
      .select("id, title, description, image_emoji, points_cost, stock, is_active, created_at, updated_at")
      .eq("is_active", true)
      .order("points_cost", { ascending: true }),
    supabase
      .from("reward_redemptions")
      .select("id, reward_name_snapshot, points_spent, status, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(6)
  ]);

  const rewards: RewardRow[] = rewardsData ?? [];
  const redemptions: RedemptionListItem[] = (redemptionsData ?? []) as RedemptionListItem[];

  return (
    <SiteShell
      title="Rewards Page"
      subtitle="Kapag sapat na ang points mo, pwede ka nang mag-claim dito ng available rewards."
    >
      <section className="content-card" style={{ marginBottom: 18 }}>
        <span className="eyebrow">Current Balance</span>
        <h2>{formatPoints(profile?.total_points ?? 0)} points available</h2>
        <p>Pumili ng reward na swak sa points mo. Ang system na ang bahala sa deduction.</p>
      </section>

      <section className="cards-grid" style={{ marginBottom: 18 }}>
        {rewards?.map((reward) => {
          const canClaim = (profile?.total_points ?? 0) >= reward.points_cost;

          return (
            <div className="reward-card" key={reward.id}>
              <div className="reward-icon">{reward.image_emoji}</div>
              <div>
                <span className="eyebrow">Reward Item</span>
                <h2>{reward.title}</h2>
                <p>{reward.description}</p>
              </div>
              <strong>{formatPoints(reward.points_cost)} pts</strong>
              <p>{reward.stock === null ? "Unlimited stock" : `${reward.stock} item(s) left`}</p>

              <form action="/api/rewards/claim" method="post">
                <input name="rewardId" type="hidden" value={reward.id} />
                <button className={canClaim ? "primary-button full-width" : "ghost-button full-width"} disabled={!canClaim}>
                  {canClaim ? "Claim this reward" : "Kulang pa ang points"}
                </button>
              </form>
            </div>
          );
        })}
      </section>

      <section className="table-card">
        <span className="eyebrow">Claim History</span>
        <h2>Recent redemptions</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Reward</th>
                <th>Points Used</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {redemptions?.length ? (
                redemptions.map((item) => (
                  <tr key={item.id}>
                    <td>{item.reward_name_snapshot}</td>
                    <td>{formatPoints(item.points_spent)} pts</td>
                    <td>{item.status}</td>
                    <td>{new Date(item.created_at).toLocaleDateString("en-PH")}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="empty-state">
                    Wala ka pang claim history.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </SiteShell>
  );
}
