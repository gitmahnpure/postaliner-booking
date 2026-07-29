import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <header className={`navbar${open ? " scrolled" : ""}`}>
      <div className="nav-inner">
        <Link to="/" className="logo" aria-label="Postliner home">
          <div className="logo-badge">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 16l3-9a2 2 0 0 1 1.9-1.4h6.2A2 2 0 0 1 17 7l3 9M4 16v3a1 1 0 0 0 1 1h1.5M4 16h16m0 0v3a1 1 0 0 1-1 1h-1.5M8.5 20v-2m7 2v-2M6.5 12h11" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="logo-text">
            <span className="brand">POSTA <span>KENYA</span></span>
            <span className="tagline">Touching lives</span>
          </div>
        </Link>

        <nav className={`links${open ? " open" : ""}`}>
          <Link to="/" className={isActive("/") ? "active" : ""}>Home</Link>
          <Link to="/book" className={isActive("/book") ? "active" : ""}>Book ticket</Link>
          <Link to="/history" className={isActive("/history") ? "active" : ""}>My bookings</Link>
          <a href="#routes">Destinations</a>
          <a href="#help">Help & support</a>
        </nav>

        <div className="nav-actions">
          <Link to="/" className="btn btn-ghost">Login</Link>
          <Link to="/" className="btn btn-solid">Register</Link>
        </div>

        <button
          type="button"
          className={`nav-toggle${open ? " open" : ""}`}
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="nav-menu"
          aria-label="Toggle navigation"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
