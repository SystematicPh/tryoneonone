import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type SiteShellProps = {
  title: string;
  subtitle: string;
  admin?: boolean;
  children: React.ReactNode;
};

export async function SiteShell({ title, subtitle, admin = false, children }: SiteShellProps) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username, role, total_points")
    .eq("id", user.id)
    .single();

  if (admin && profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="brand">
          <span className="brand-badge">KR</span>
          <div>
            <strong>Kuya Ron&apos;s Store</strong>
            <p>Store Points Rewards</p>
          </div>
        </Link>

        <nav className="nav-links">
          {admin ? (
            <>
              <Link href="/admin">Admin Dashboard</Link>
              <Link href="/admin/users">User Management</Link>
              <Link href="/admin/points">Points Management</Link>
              <Link href="/admin/rewards">Rewards Management</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/rewards">Rewards</Link>
            </>
          )}
        </nav>

        <div className="sidebar-card">
          <span className="eyebrow">{admin ? "Admin Access" : "Customer Account"}</span>
          <h3>{profile?.full_name}</h3>
          <p>@{profile?.username}</p>
          {!admin && <strong>{profile?.total_points ?? 0} pts</strong>}
          {admin && <strong>Role: {profile?.role}</strong>}
        </div>

        <form action="/api/auth/logout" method="post">
          <button className="ghost-button full-width" type="submit">
            Logout
          </button>
        </form>
      </aside>

      <main className="main-panel">
        <header className="page-header">
          <div>
            <span className="eyebrow">{admin ? "Admin Panel" : "Rewards Center"}</span>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
