import { SiteShell } from "@/components/site-shell";
import type { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPeso, formatPoints } from "@/lib/utils";

type LeaderboardEntry = Database["public"]["Views"]["leaderboard"]["Row"];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: leaderboardData }, { data: transactions }, { data: rewards }] = await Promise.all([
    supabase.from("profiles").select("full_name, total_points").eq("id", user!.id).single(),
    supabase.from("leaderboard").select("rank_number, full_name, username, total_points").limit(8),
    supabase
      .from("point_transactions")
      .select("id, amount_spent, points_awarded, created_at, notes")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("rewards").select("id, title, points_cost, is_active").eq("is_active", true).limit(3)
  ]);

  const leaderboard: LeaderboardEntry[] = leaderboardData ?? [];

  return (
    <SiteShell
      title={`Hello, ${profile?.full_name?.split(" ")[0] ?? "Customer"}!`}
      subtitle="Ito ang quick view ng points mo, recent earning history, at top customers ng store."
    >
      <section className="panel-grid three">
        <div className="metric-card">
          <span className="eyebrow">Total Points</span>
          <h2>{formatPoints(profile?.total_points ?? 0)} pts</h2>
          <p>Ready na ito for reward claiming kapag sapat na ang balance mo.</p>
        </div>

        <div className="metric-card">
          <span className="eyebrow">Rewards</span>
          <h2>{rewards?.length ?? 0} active items</h2>
          <p>Silipin ang rewards page para makita kung ano ang pwede mong i-claim.</p>
        </div>

        <div className="metric-card">
          <span className="eyebrow">Status</span>
          <h2 className="status-good">Active loyalty member</h2>
          <p>Keep shopping para mas mabilis ma-unlock ang mas matataas na rewards.</p>
        </div>
      </section>

      <section className="panel-grid two" style={{ marginTop: 18 }}>
        <div className="table-card">
          <span className="eyebrow">Recent Points Activity</span>
          <h2>Latest purchases</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Purchase</th>
                  <th>Points</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {transactions?.length ? (
                  transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{formatDate(transaction.created_at)}</td>
                      <td>{formatPeso(transaction.amount_spent)}</td>
                      <td>
                        <strong>{formatPoints(transaction.points_awarded)} pts</strong>
                      </td>
                      <td>{transaction.notes || "Store purchase"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="empty-state">
                      Wala pang points activity. Hintayin ang first encoded purchase mo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="content-card">
          <span className="eyebrow">Leaderboard</span>
          <h2>Top customers</h2>
          <div className="stack">
            {leaderboard?.map((entry) => (
              <div key={entry.username ?? `${entry.rank_number ?? 0}`} className="sidebar-card">
                <strong>
                  #{entry.rank_number} {entry.full_name}
                </strong>
                <p>@{entry.username}</p>
                <span className="badge">{formatPoints(entry.total_points ?? 0)} pts</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
