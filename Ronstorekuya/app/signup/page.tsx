import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand-inline">
          <span className="brand-badge">KR</span>
          <div>
            <strong>Kuya Ron&apos;s Store</strong>
            <p>Start earning points today</p>
          </div>
        </div>

        <h1>Gawa tayo ng account.</h1>
        <p>Name, username, at password lang. Simple lang pero ready na for actual store use.</p>

        <form action="/api/auth/signup" method="post">
          <label>
            Full Name
            <input name="fullName" placeholder="Juan Dela Cruz" required />
          </label>

          <label>
            Username
            <input name="username" placeholder="juandelacruz" required />
          </label>

          <label>
            Password
            <input name="password" type="password" placeholder="At least 6 characters" minLength={6} required />
          </label>

          <button className="primary-button full-width" type="submit">
            Create account
          </button>
        </form>

        <div className="auth-switch helper-text">
          <span>May account na?</span>
          <Link href="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
}
