import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../context/AuthContext";
import logoSrc from "../assets/logo.png";

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  return (
    <header id="header" className={scrolled ? "scrolled" : ""}>
      <div className="nav-inner">
        <Link to="/" className="logo" aria-label="Postliner home">
          <div className="logo-badge">
            <img src={logoSrc} alt="Postliner logo" className="logo-img" />
          </div>
        </Link>

        <nav className={`links${open ? " open" : ""}`}>
          <Link to="/" className={isActive("/") ? "active" : ""} onClick={() => setOpen(false)}>Home</Link>
          <Link to="/book" className={isActive("/book") ? "active" : ""} onClick={() => setOpen(false)}>Book ticket</Link>
          <Link to="/history" className={isActive("/history") ? "active" : ""} onClick={() => setOpen(false)}>My bookings</Link>
          <Link to="/destinations" className={isActive("/destinations") ? "active" : ""} onClick={() => setOpen(false)}>Destinations</Link>
          <Link to="/help" className={isActive("/help") ? "active" : ""} onClick={() => setOpen(false)}>
            Help &amp; support
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </nav>

        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <span className="nav-user">{user?.name || user?.username || "User"}</span>
              <button type="button" className="btn btn-ghost" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20c1.5-3.5 4.7-5.5 8-5.5s6.5 2 8 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Login
              </Link>
              <Link to="/register" className="btn btn-solid">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2.5 20c1.4-3.4 3.7-5.5 6.5-5.5M17 8v6M20 11h-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Register
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className={`nav-toggle${open ? " open" : ""}`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
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
