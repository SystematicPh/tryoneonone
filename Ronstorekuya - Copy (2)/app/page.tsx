import Link from "next/link";

export default function HomePage() {
  return (
    <div className="landing-wrap">
      <div className="landing-card">
        <header className="topbar">
          <div className="brand-inline">
            <span className="brand-badge">KR</span>
            <div>
              <strong>Kuya Ron&apos;s Store</strong>
              <p>Modern rewards na sulit balikan</p>
            </div>
          </div>

          <nav className="top-links">
            <Link href="#features">Features</Link>
            <Link href="#flow">How It Works</Link>
            <Link href="/login">Login</Link>
            <Link href="/signup">Signup</Link>
          </nav>
        </header>

        <section className="landing-hero">
          <div className="hero-copy">
            <span className="eyebrow">Loyalty Made Simple</span>
            <h1>Mas maraming bili, mas maraming balik na rewards.</h1>
            <p>
              Welcome sa Kuya Ron&apos;s Store Points Rewards System. Clean, mabilis, at madaling gamitin para sa
              customers at admin. Track points, redeem rewards, at bantayan ang top supporters ng store sa isang
              modern red-and-white experience.
            </p>

            <div className="hero-actions">
              <Link className="primary-button" href="/signup">
                Gumawa ng account
              </Link>
              <Link className="secondary-button" href="/login">
                May account na ako
              </Link>
            </div>
          </div>

          <div className="hero-panel">
            <span className="eyebrow">Bilis ng System</span>
            <div className="hero-list">
              <div>
                <strong>Smart points conversion</strong>
                <p>Automatic ang points kapag nilagay ni admin ang total purchase amount.</p>
              </div>
              <div>
                <strong>Customer-first dashboard</strong>
                <p>Kita agad ang points, leaderboard, at available rewards sa isang tingin.</p>
              </div>
              <div>
                <strong>Admin tools na diretsahan</strong>
                <p>Manage users, rewards, settings, at analytics nang hindi magulo tingnan.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-block" id="features">
          <div className="stats-grid">
            <div className="metric-card">
              <span className="eyebrow">Customer</span>
              <h2>Dashboard</h2>
              <p>Check points, redeem rewards, at sumilip sa leaderboard anytime.</p>
            </div>
            <div className="metric-card">
              <span className="eyebrow">Admin</span>
              <h2>Analytics</h2>
              <p>Today, week, month, at yearly totals para alam ang galaw ng store.</p>
            </div>
            <div className="metric-card">
              <span className="eyebrow">Flexible</span>
              <h2>Points Rules</h2>
              <p>Madaling baguhin ang equivalent ng purchase amount at points.</p>
            </div>
            <div className="metric-card">
              <span className="eyebrow">Secure</span>
              <h2>Role-Based</h2>
              <p>Admin-only routes stay protected while customers keep a smooth flow.</p>
            </div>
          </div>
        </section>

        <section className="section-block" id="flow">
          <div className="cards-grid">
            <div className="content-card">
              <span className="eyebrow">01</span>
              <h2>Signup without email</h2>
              <p>Username, full name, at password lang ang kailangan para makapasok sa system.</p>
            </div>
            <div className="content-card">
              <span className="eyebrow">02</span>
              <h2>Earn points from purchases</h2>
              <p>Si admin lang ang mag-eencode ng purchase amount at automatic ang points conversion.</p>
            </div>
            <div className="content-card">
              <span className="eyebrow">03</span>
              <h2>Claim rewards kapag ready na</h2>
              <p>Kapag sapat na ang points, pwedeng mag-claim agad ng reward from the customer page.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
