import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand-inline">
          <span className="brand-badge">KR</span>
          <div>
            <strong>Kuya Ron&apos;s Store</strong>
            <p>Login sa rewards account mo</p>
          </div>
        </div>

        <h1>Welcome back.</h1>
        <p>Mag-login gamit ang username at password mo. Walang email na kailangan dito.</p>

        <form action="/api/auth/login" method="post">
          <label>
            Username
            <input name="username" placeholder="halimbawa: juandelacruz" required />
          </label>

          <label>
            Password
            <input name="password" type="password" placeholder="Ilagay ang password" required />
          </label>

          <button className="primary-button full-width" type="submit">
            Login
          </button>
        </form>

        <div className="auth-switch helper-text">
          <span>Wala pang account?</span>
          <Link href="/signup">Signup here</Link>
        </div>
      </div>
    </div>
  );
}
