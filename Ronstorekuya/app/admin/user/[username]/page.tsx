import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPeso, formatPoints } from "@/lib/utils";

export default async function AdminUserDetailPage({
  params
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: userProfile } = await supabase
    .from("profiles")
    .select("id, full_name, username, total_points, role")
    .eq("username", username)
    .maybeSingle();

  if (!userProfile) {
    notFound();
  }

  const { data: transactions } = await supabase
    .from("point_transactions")
    .select("id, created_at, amount_spent, points_awarded, notes")
    .eq("user_id", userProfile.id)
    .order("created_at", { ascending: false })
    .limit(12);

  return (
    <SiteShell
      admin
      title={`User Page: @${userProfile.username}`}
      subtitle="Dedicated admin-only page para sa isang customer. Dito ka mag-eencode ng purchase at points will follow automatically."
    >
      <section className="panel-grid two" style={{ marginBottom: 18 }}>
        <div className="content-card">
          <span className="eyebrow">User Snapshot</span>
          <h2>{userProfile.full_name}</h2>
          <p>Username: @{userProfile.username}</p>
          <p>Role: {userProfile.role}</p>
          <strong>{formatPoints(userProfile.total_points)} total points</strong>
        </div>

        <div className="table-card">
          <span className="eyebrow">Add Points</span>
          <h2>Encode purchase amount</h2>
          <form action="/api/admin/add-points" method="post" className="stack">
            <input type="hidden" name="username" value={userProfile.username} />
            <label>
              Purchase Amount (PHP)
              <input min="1" name="amount" step="0.01" type="number" required />
            </label>
            <label>
              Notes
              <input name="notes" placeholder="Optional note, halimbawa: grocery bundle" />
            </label>
            <button className="primary-button" type="submit">
              Add purchase and points
            </button>
          </form>
        </div>
      </section>

      <section className="table-card">
        <span className="eyebrow">Transaction History</span>
        <h2>Recent encoded purchases</h2>
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
                transactions.map((entry) => (
                  <tr key={entry.id}>
                    <td>{formatDate(entry.created_at)}</td>
                    <td>{formatPeso(entry.amount_spent)}</td>
                    <td>{formatPoints(entry.points_awarded)} pts</td>
                    <td>{entry.notes || "Store purchase"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="empty-state">
                    Wala pang encoded purchase for this customer.
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
