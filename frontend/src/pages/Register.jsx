import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../components/Page.css";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.username.trim() || !form.password) return;
    setError(null);
    setLoading(true);
    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="auth-card">
        <h1 className="page-title">Create account</h1>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="regName">Full name</label>
            <input
              id="regName"
              type="text"
              value={form.name}
              onChange={update("name")}
              placeholder="Jane Wanjiru"
              autoComplete="name"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="regEmail">Email</label>
            <input
              id="regEmail"
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder="jane@example.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="regPhone">Phone</label>
            <input
              id="regPhone"
              type="tel"
              value={form.phone}
              onChange={update("phone")}
              placeholder="07XX XXX XXX"
              autoComplete="tel"
            />
          </div>
          <div className="field">
            <label htmlFor="regUsername">Username</label>
            <input
              id="regUsername"
              type="text"
              value={form.username}
              onChange={update("username")}
              placeholder="Choose a username"
              autoComplete="username"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="regPassword">Password</label>
            <input
              id="regPassword"
              type="password"
              value={form.password}
              onChange={update("password")}
              placeholder="Create a password"
              autoComplete="new-password"
              required
            />
          </div>
          {error && (
            <div className="error-banner" role="alert">
              <strong>Registration failed</strong>
              <p>{error}</p>
            </div>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating account…" : "Register"}
          </button>
        </form>
        <p className="auth-alt">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
