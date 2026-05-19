import { SiteShell } from "@/components/site-shell";
import type { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";
import { formatPeso, formatPoints } from "@/lib/utils";

type RangeStats = {
  label: string;
  purchase: number;
  points: number;
};

type LeaderboardEntry = Database["public"]["Views"]["leaderboard"]["Row"];

function getPeriodTotals(rows: { created_at: string; amount_spent: number; points_awarded: number }[]): RangeStats[] {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const ranges = [
    { label: "Today", start: todayStart },
    { label: "This Week", start: weekStart },
    { label: "This Month", start: monthStart },
    { label: "This Year", start: yearStart }
  ];

  return ranges.map((range) => {
    const filtered = rows.filter((row) => new Date(row.created_at) >= range.start);
    return {
      label: range.label,
      purchase: filtered.reduce((sum, row) => sum + row.amount_spent, 0),
      points: filtered.reduce((sum, row) => sum + row.points_awarded, 0)
    };
  });
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ data: transactions }, { data: leaderboardData }] = await Promise.all([
    supabase
      .from("point_transactions")
      .select("created_at, amount_spent, points_awarded")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase.from("leaderboard").select("rank_number, full_name, username, total_points").limit(10)
  ]);

  const stats = getPeriodTotals(transactions ?? []);
  const leaderboard: LeaderboardEntry[] = leaderboardData ?? [];

  return (
    <SiteShell
      admin
      title="Admin Dashboard"
      subtitle="Quick analytics ng points at purchases para kita agad ang takbo ng loyalty program."
    >
      <section className="panel-grid three">
        {stats.map((item) => (
          <div className="metric-card" key={item.label}>
            <span className="eyebrow">{item.label}</span>
            <h2>{formatPeso(item.purchase)}</h2>
            <p>{formatPoints(item.points)} total points generated</p>
          </div>
        ))}
      </section>

      <section className="panel-grid two" style={{ marginTop: 18 }}>
        <div className="content-card">
          <span className="eyebrow">Program Snapshot</span>
          <h2>What&apos;s happening ngayon</h2>
          <p>
            Ito ang main overview ng encoded purchases at total points produced across the rewards system. Use the side
            menu para mag-manage ng users, conversion rules, at rewards catalog.
          </p>
        </div>

        <div className="table-card">
          <span className="eyebrow">Top Customers</span>
          <h2>Total points leaderboard</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard?.map((entry) => (
                  <tr key={entry.username ?? `${entry.rank_number ?? 0}`}>
                    <td>#{entry.rank_number}</td>
                    <td>{entry.full_name}</td>
                    <td>@{entry.username}</td>
                    <td>{formatPoints(entry.total_points ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
