import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { createClient } from "@/lib/supabase/server";
import { formatPoints } from "@/lib/utils";

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search = "" } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, username, full_name, total_points, role")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%`);
  }

  const { data: users } = await query;

  return (
    <SiteShell
      admin
      title="User Management"
      subtitle="Search users, open their profile page, at mag-add ng purchase-based points nang mabilis."
    >
      <section className="table-card" style={{ marginBottom: 18 }}>
        <span className="eyebrow">Search Users</span>
        <h2>Hanapin ang customer</h2>
        <form className="field-grid two" method="get">
          <label>
            Search by name or username
            <input defaultValue={search} name="search" placeholder="hal. ron, juan, maria" />
          </label>
          <button className="primary-button right" type="submit">
            Search
          </button>
        </form>
      </section>

      <section className="table-card">
        <span className="eyebrow">Users List</span>
        <h2>All registered accounts</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Points</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users?.length ? (
                users.map((profile) => (
                  <tr key={profile.id}>
                    <td>{profile.full_name}</td>
                    <td>@{profile.username}</td>
                    <td>{profile.role}</td>
                    <td>{formatPoints(profile.total_points)} pts</td>
                    <td>
                      <Link className="secondary-button" href={`/admin/user/${profile.username}`}>
                        Open user page
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="empty-state">
                    Walang user na tugma sa search mo.
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
