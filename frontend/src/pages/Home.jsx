import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import Hero from "../components/Hero";
import "../components/Page.css";
import "./Home.css";
import logoSrc from "../assets/logo.png";

function Home() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState("1 Passenger");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([api.getLocations(), api.getRoutes()])
      .then(([loc, rts]) => {
        if (cancelled) return;
        setLocations(loc);
        setRoutes(rts);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!from || !to || !date) return;
    const route = routes.find((r) => {
      const f = r.from_location?.toLowerCase() || "";
      const t = r.to_location?.toLowerCase() || "";
      return f.includes(from.toLowerCase()) && t.includes(to.toLowerCase());
    });
    if (!route) {
      setError("No matching route found. Try Nairobi → Busia or Busia → Nairobi.");
      return;
    }
    navigate("/book", {
      state: {
        routeId: route.id,
        routeLabel: `${route.from_location} → ${route.to_location}`,
        date,
        passengers: parseInt(passengers, 10) || 1,
      },
    });
  };

  // Scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [loading]);

  // Stat counters
  useEffect(() => {
    const counters = document.querySelectorAll(".stat .num");
    const counted = new WeakSet();
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !counted.has(entry.target)) {
            counted.add(entry.target);
            const el = entry.target;
            const target = parseInt(el.dataset.count, 10);
            const suffix = el.dataset.suffix || "";
            const hasPlus = el.querySelector(".plus") !== null;
            const dur = 1600;
            const start = performance.now();
            function tick(now) {
              const p = Math.min((now - start) / dur, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              const val = Math.floor(target * eased);
              el.textContent = val.toLocaleString();
              if (hasPlus) {
                const span = document.createElement("span");
                span.className = "plus";
                el.prepend(span);
              }
              if (suffix) el.textContent = val.toLocaleString() + suffix;
              if (p < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => cio.observe(el));
    return () => cio.disconnect();
  }, [loading]);

  const handleSearchClick = () => {
    const btn = document.getElementById("searchBtn");
    if (!btn) return;
    const original = btn.innerHTML;
    btn.innerHTML = "Searching…";
    btn.style.opacity = ".85";
    setTimeout(() => {
      document.getElementById("routes")?.scrollIntoView({ behavior: "smooth", block: "start" });
      btn.innerHTML = original;
      btn.style.opacity = "1";
    }, 700);
  };

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" aria-label="Loading" />
        <p className="loading-text">Loading routes…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-center">
        <div className="error-banner">
          <strong>Unable to load routes</strong>
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <Hero />

      <div className="container">
        <div className="search-card" id="a-search">
          <div className="field">
            <label htmlFor="fromInput">From</label>
            <div className="input-wrap">
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.8" /></svg>
              <input id="fromInput" type="text" list="locations" placeholder="Select departure" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
          </div>
          <button className="swap-btn" id="swapBtn" onClick={handleSwap} aria-label="Swap origin and destination" type="button">
            <svg viewBox="0 0 24 24" fill="none"><path d="M7 7h13M17 3l3 4-3 4M17 17H4M7 21l-3-4 3-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div className="field">
            <label htmlFor="toInput">To</label>
            <div className="input-wrap">
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.8" /></svg>
              <input id="toInput" type="text" list="locations" placeholder="Select destination" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="date">Journey date</label>
            <div className="input-wrap">
              <svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="5" width="17" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.8" /><path d="M8 3v4M16 3v4M3.5 10h17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="passengers">Passengers</label>
            <div className="input-wrap">
              <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.8" /><path d="M5 20c1.6-4 4-6 7-6s5.4 2 7 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              <select id="passengers" value={passengers} onChange={(e) => setPassengers(e.target.value)}>
                {Array.from({ length: 6 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={`${n} Passenger${n > 1 ? "s" : ""}`}>
                    {n} Passenger{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button className="search-btn" id="searchBtn" type="button" onClick={() => { handleSearchClick(); handleSearch(new Event("submit")); }}>
            <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#fff" strokeWidth="2" /><path d="M21 21l-4.3-4.3" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
            Search buses
          </button>
          {locations.length > 0 && (
            <datalist id="locations">
              {locations.map((loc) => (
                <option key={loc.id} value={loc.name} />
              ))}
            </datalist>
          )}
        </div>
      </div>

      <section className="stats-band">
        <div className="container">
          <div className="stats-inner">
            <div className="stat reveal"><div className="num" data-count="47">0</div><div className="label">Counties covered</div></div>
            <div className="stat reveal"><div className="num" data-count="120"><span className="plus" />0</div><div className="label">Daily departures</div></div>
            <div className="stat reveal"><div className="num" data-count="850000" data-suffix="+">0</div><div className="label">Happy travelers</div></div>
            <div className="stat reveal"><div className="num" data-count="98" data-suffix="%">0</div><div className="label">On-time arrivals</div></div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="sec-head reveal">
            <span className="sec-eyebrow">Why ride with us</span>
            <h2>Built for the Kenyan road, mile after mile</h2>
            <p>Every fleet, route and support line is designed around one thing — getting you there safely, on time, in comfort.</p>
          </div>
          <div className="feature-grid reveal-stagger">
            <div className="feature-card reveal" style={{ "--d": "0s" }}>
              <div className="feature-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v6c0 4.6-3 8.4-7 9.4-4-1-7-4.8-7-9.4V6l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <h3>Safe &amp; secure</h3>
              <p>Your safety is our priority, backed by trusted travel standards and vetted drivers on every route.</p>
            </div>
            <div className="feature-card reveal" style={{ "--d": "0.08s" }}>
              <div className="feature-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M4 18v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6M4 18h16M6 18v2M18 18v2M6 10V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <h3>Comfortable journeys</h3>
              <p>Spacious reclining seats and modern coaches designed for a relaxed, restful ride.</p>
            </div>
            <div className="feature-card reveal" style={{ "--d": "0.16s" }}>
              <div className="feature-icon"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" /><path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <h3>On time, always</h3>
              <p>We value your schedule and hold ourselves to strict, dependable departure times.</p>
            </div>
            <div className="feature-card reveal" style={{ "--d": "0.24s" }}>
              <div className="feature-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M3 12a9 9 0 1 1 9 9M3 12l3-3M3 12l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="1.4" fill="currentColor" /></svg></div>
              <h3>24/7 customer support</h3>
              <p>Real people, ready to help with bookings, changes, or questions anytime, anywhere.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="routes" id="routes">
        <div className="container">
          <div className="sec-head reveal">
            <span className="sec-eyebrow">Popular routes</span>
            <h2>Kenya&apos;s best-loved journeys</h2>
            <p>From coastal sunrises to highland air — these are the routes travelers book again and again.</p>
          </div>
          <div className="route-list reveal-stagger">
            <div className="route-card reveal" style={{ "--d": "0s" }}>
              <div className="route-top"><span className="route-code mono">RT-001 · DAILY</span><span className="route-badge">Most booked</span></div>
              <div className="route-cities"><span className="city">Nairobi</span><div className="route-line-mini" /><span className="city">Mombasa</span></div>
              <div className="route-meta"><span><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>8h 15m</span><span><svg viewBox="0 0 24 24" fill="none"><path d="M4 18v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6" stroke="currentColor" strokeWidth="1.6" /><circle cx="7" cy="18" r="1.4" fill="currentColor" /><circle cx="17" cy="18" r="1.4" fill="currentColor" /></svg>14 seats left</span></div>
              <div className="route-foot"><div className="route-price">KES 1,500 <span>/seat</span></div><button className="route-cta" type="button">Book now <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button></div>
            </div>
            <div className="route-card reveal" style={{ "--d": "0.1s" }}>
              <div className="route-top"><span className="route-code mono">RT-014 · DAILY</span><span className="route-badge">Scenic</span></div>
              <div className="route-cities"><span className="city">Nairobi</span><div className="route-line-mini" /><span className="city">Kisumu</span></div>
              <div className="route-meta"><span><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>6h 40m</span><span><svg viewBox="0 0 24 24" fill="none"><path d="M4 18v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6" stroke="currentColor" strokeWidth="1.6" /><circle cx="7" cy="18" r="1.4" fill="currentColor" /><circle cx="17" cy="18" r="1.4" fill="currentColor" /></svg>22 seats left</span></div>
              <div className="route-foot"><div className="route-price">KES 1,200 <span>/seat</span></div><button className="route-cta" type="button">Book now <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button></div>
            </div>
            <div className="route-card reveal" style={{ "--d": "0.2s" }}>
              <div className="route-top"><span className="route-code mono">RT-027 · DAILY</span><span className="route-badge">Express</span></div>
              <div className="route-cities"><span className="city">Nakuru</span><div className="route-line-mini" /><span className="city">Eldoret</span></div>
              <div className="route-meta"><span><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>2h 50m</span><span><svg viewBox="0 0 24 24" fill="none"><path d="M4 18v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6" stroke="currentColor" strokeWidth="1.6" /><circle cx="7" cy="18" r="1.4" fill="currentColor" /><circle cx="17" cy="18" r="1.4" fill="currentColor" /></svg>9 seats left</span></div>
              <div className="route-foot"><div className="route-price">KES 800 <span>/seat</span></div><button className="route-cta" type="button">Book now <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button></div>
            </div>
          </div>
        </div>
      </section>

      <section className="steps">
        <div className="container">
          <div className="sec-head reveal">
            <span className="sec-eyebrow">How it works</span>
            <h2>Book your seat in three steps</h2>
            <p>No queues, no paperwork — just a smooth path from search to seat.</p>
          </div>
          <div className="step-row reveal-stagger">
            <div className="step reveal" style={{ "--d": "0s" }}>
              <div className="step-num">1</div>
              <h3>Search your route</h3>
              <p>Pick your departure, destination and travel date to see live buses.</p>
            </div>
            <div className="step reveal" style={{ "--d": "0.12s" }}>
              <div className="step-num">2</div>
              <h3>Choose your seat</h3>
              <p>Compare times and coaches, then pick the exact seat you want.</p>
            </div>
            <div className="step reveal" style={{ "--d": "0.24s" }}>
              <div className="step-num">3</div>
              <h3>Pay &amp; travel</h3>
              <p>Pay securely with M-Pesa or card and get your ticket instantly.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials">
        <div className="container">
          <div className="sec-head reveal">
            <span className="sec-eyebrow">Traveler stories</span>
            <h2>Trusted across the country</h2>
            <p>Real reviews from riders who&apos;ve made Posta Kenya part of their journey.</p>
          </div>
          <div className="t-grid reveal-stagger">
            <div className="t-card reveal" style={{ "--d": "0s" }}>
              <div className="t-stars">★★★★★</div>
              <p className="quote">Booked my Nairobi to Mombasa ticket in under two minutes. The seat was exactly as shown and the bus left right on time.</p>
              <div className="t-person"><div className="t-avatar" style={{ background: "var(--red)" }}>WM</div><div><div className="name">Wanjiru M.</div><div className="role">Nairobi → Mombasa</div></div></div>
            </div>
            <div className="t-card reveal" style={{ "--d": "0.1s" }}>
              <div className="t-stars">★★★★★</div>
              <p className="quote">Support team helped me rebook after I missed my slot, no hassle at all. This is now my default way to travel upcountry.</p>
              <div className="t-person"><div className="t-avatar" style={{ background: "var(--blue)" }}>OK</div><div><div className="name">Otieno K.</div><div className="role">Nairobi → Kisumu</div></div></div>
            </div>
            <div className="t-card reveal" style={{ "--d": "0.2s" }}>
              <div className="t-stars">★★★★★</div>
              <p className="quote">Clean coaches, comfortable legroom and a driver who actually kept to the schedule. Couldn&apos;t ask for more on a long ride.</p>
              <div className="t-person"><div className="t-avatar" style={{ background: "var(--navy)" }}>AN</div><div><div className="name">Amina N.</div><div className="role">Nakuru → Eldoret</div></div></div>
            </div>
          </div>
        </div>
      </section>

      <div className="cta-band reveal">
        <div>
          <h2>Your next journey is one search away</h2>
          <p>Join thousands of travelers who book with Posta Kenya every day.</p>
        </div>
        <button className="btn-white" type="button" onClick={() => document.getElementById("fromInput")?.scrollIntoView({ behavior: "smooth", block: "center" })}>
          Book your ticket
          <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>

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
              <a href="/about">About us</a>
              <a href="#">Careers</a>
              <a href="#">Newsroom</a>
              <a href="#">Partners</a>
            </div>
            <div className="footer-col">
              <h4>Support</h4>
              <a href="/help">Help center</a>
              <a href="#">Refunds</a>
              <a href="/track">Track ticket</a>
              <a href="/terms">Terms of use</a>
            </div>
            <div className="footer-col">
              <h4>Destinations</h4>
              <a href="/destinations">Nairobi</a>
              <a href="/destinations">Mombasa</a>
              <a href="/destinations">Kisumu</a>
              <a href="/destinations">Eldoret</a>
            </div>
            <div className="footer-col">
              <h4>Contact</h4>
              <div className="contact-row"><svg viewBox="0 0 24 24" fill="none"><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.8" /></svg><span>Posta House, Kenyatta Ave, Nairobi</span></div>
              <div className="contact-row"><svg viewBox="0 0 24 24" fill="none"><path d="M3 5h4l2 5-2.5 1.5a11 11 0 0 0 5 5L13 14l5 2v4a2 2 0 0 1-2 2C9 22 2 15 2 7a2 2 0 0 1 1-2z" stroke="currentColor" strokeWidth="1.6" /></svg><span>0800 220 220</span></div>
              <div className="contact-row"><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.6" /></svg><span>hello@postakenya.co.ke</span></div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>&copy; 2026 Posta Kenya. All rights reserved.</span>
            <span className="legal"><a href="/privacy">Privacy policy</a><a href="/terms">Terms</a><a href="#">Cookies</a></span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
