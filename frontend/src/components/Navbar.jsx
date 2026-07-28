import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import "./Navbar.css";

function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <Link to="/" className="logo" aria-label="Postliner home">
        <img src={logo} alt="Postliner Logo" />
      </Link>

      <button
        type="button"
        className={`nav-toggle${open ? " open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="nav-menu"
        aria-label="Toggle navigation"
      >
        <span />
        <span />
        <span />
      </button>

      <ul id="nav-menu" className={`nav-links${open ? " open" : ""}`}>
        <li><Link to="/" className={isActive("/") ? "active" : ""}>Home</Link></li>
        <li><Link to="/" className={isActive("/") ? "active" : ""}>Routes</Link></li>
        <li><Link to="/history" className={isActive("/history") ? "active" : ""}>My Bookings</Link></li>
        <li><Link to="/">About</Link></li>
        <li><Link to="/">Contact</Link></li>
      </ul>

      <Link to="/" className="login-btn">
        Login
      </Link>
    </nav>
  );
}

export default Navbar;
