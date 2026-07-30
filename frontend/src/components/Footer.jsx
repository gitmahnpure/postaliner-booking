import { Link } from "react-router-dom";
import "./Footer.css";
import logoSrc from "../assets/logo.png";

function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo">
              <div className="logo-badge">
                <img src={logoSrc} alt="Postliner logo" className="logo-img" />
              </div>
              <div className="logo-text"><span className="brand">POSTA <span>KENYA</span></span></div>
            </div>
            <p>Connecting Kenya, one journey at a time. Safe, comfortable and reliable bus travel across 47 counties.</p>
            <div className="foot-social">
              <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="none"><path d="M14 9h3V6h-3a4 4 0 0 0-4 4v2H8v3h2v6h3v-6h2.5l.5-3H13v-1.5A1.5 1.5 0 0 1 14.5 9H14z" fill="#fff" /></svg></a>
              <a href="#" aria-label="Twitter / X"><svg viewBox="0 0 24 24" fill="none"><path d="M4 4l16 16M20 4L4 20" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" /></svg></a>
              <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="4" stroke="#fff" strokeWidth="1.6" /><circle cx="12" cy="12" r="3.4" stroke="#fff" strokeWidth="1.6" /><circle cx="16.6" cy="7.4" r="1" fill="#fff" /></svg></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/about">About us</Link>
            <a href="#">Careers</a>
            <a href="#">Newsroom</a>
            <a href="#">Partners</a>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <Link to="/help">Help center</Link>
            <a href="#">Refunds</a>
            <Link to="/track">Track ticket</Link>
            <Link to="/terms">Terms of use</Link>
          </div>
          <div className="footer-col">
            <h4>Destinations</h4>
            <Link to="/destinations">Nairobi</Link>
            <Link to="/destinations">Mombasa</Link>
            <Link to="/destinations">Kisumu</Link>
            <Link to="/destinations">Eldoret</Link>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <div className="contact-row">
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.8" /></svg>
              <span>Posta House, Kenyatta Ave, Nairobi</span>
            </div>
            <div className="contact-row">
              <svg viewBox="0 0 24 24" fill="none"><path d="M3 5h4l2 5-2.5 1.5a11 11 0 0 0 5 5L13 14l5 2v4a2 2 0 0 1-2 2C9 22 2 15 2 7a2 2 0 0 1 1-2z" stroke="currentColor" strokeWidth="1.6" /></svg>
              <span>0800 220 220</span>
            </div>
            <div className="contact-row">
              <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.6" /></svg>
              <span>hello@postakenya.co.ke</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 Posta Kenya. All rights reserved.</span>
          <span className="legal"><Link to="/privacy">Privacy policy</Link><Link to="/terms">Terms</Link><a href="#">Cookies</a></span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
