import "../components/Page.css";
import "./Home.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import Hero from "../components/Hero";

function Home() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleSearch = (values) => {
    const route = routes.find((r) => {
      const from = r.from_location?.toLowerCase() || "";
      const to = r.to_location?.toLowerCase() || "";
      return (
        from.includes(values.from.toLowerCase()) &&
        to.includes(values.to.toLowerCase())
      );
    });

    if (!route) {
      setError("No matching route found. Try Nairobi → Busia or Busia → Nairobi.");
      return;
    }

    navigate("/book", {
      state: {
        routeId: route.id,
        routeLabel: `${route.from_location} → ${route.to_location}`,
        date: values.date,
        passengers: values.passengers,
      },
    });
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
      <Hero locations={locations} onSearch={handleSearch} />

      <section className="stats-band">
        <div className="container">
          <div className="stats-inner">
            <div className="stat">
              <div className="num">47</div>
              <div className="label">Counties covered</div>
            </div>
            <div className="stat">
              <div className="num">120</div>
              <div className="label">Daily departures</div>
            </div>
            <div className="stat">
              <div className="num">850k+</div>
              <div className="label">Happy travelers</div>
            </div>
            <div className="stat">
              <div className="num">98%</div>
              <div className="label">On-time arrivals</div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="section-head">
            <span className="section-eyebrow">Why ride with us</span>
            <h2>Built for the Kenyan road, mile after mile</h2>
            <p>Every fleet, route and support line is designed around one thing — getting you there safely, on time, in comfort.</p>
          </div>
          <div className="feature-grid">
            <article className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Safe & secure</h3>
              <p>Your safety is our priority, backed by trusted travel standards and vetted drivers on every route.</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon">💺</div>
              <h3>Comfortable journeys</h3>
              <p>Spacious reclining seats and modern coaches designed for a relaxed, restful ride.</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon">⏱️</div>
              <h3>On time, always</h3>
              <p>We value your schedule and hold ourselves to strict, dependable departure times.</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon">🎧</div>
              <h3>24/7 customer support</h3>
              <p>Real people, ready to help with bookings, changes, or questions anytime, anywhere.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="routes" id="routes">
        <div className="container">
          <div className="section-head">
            <span className="section-eyebrow">Popular routes</span>
            <h2>Kenya's best-loved journeys</h2>
            <p>From coastal sunrises to highland air — these are the routes travelers book again and again.</p>
          </div>
          <div className="route-list">
            <div className="route-card">
              <div className="route-top">
                <span className="route-code mono">RT-001 · DAILY</span>
                <span className="route-badge">Most booked</span>
              </div>
              <div className="route-cities">
                <span className="city">Nairobi</span>
                <span className="route-line-mini" />
                <span className="city">Mombasa</span>
              </div>
              <div className="route-meta">
                <span>8h 15m</span>
                <span>14 seats left</span>
              </div>
              <div className="route-foot">
                <div className="route-price">KES 1,500 <span>/seat</span></div>
                <button className="route-cta">Book now</button>
              </div>
            </div>
            <div className="route-card">
              <div className="route-top">
                <span className="route-code mono">RT-014 · DAILY</span>
                <span className="route-badge">Scenic</span>
              </div>
              <div className="route-cities">
                <span className="city">Nairobi</span>
                <span className="route-line-mini" />
                <span className="city">Kisumu</span>
              </div>
              <div className="route-meta">
                <span>6h 40m</span>
                <span>22 seats left</span>
              </div>
              <div className="route-foot">
                <div className="route-price">KES 1,200 <span>/seat</span></div>
                <button className="route-cta">Book now</button>
              </div>
            </div>
            <div className="route-card">
              <div className="route-top">
                <span className="route-code mono">RT-027 · DAILY</span>
                <span className="route-badge">Express</span>
              </div>
              <div className="route-cities">
                <span className="city">Nakuru</span>
                <span className="route-line-mini" />
                <span className="city">Eldoret</span>
              </div>
              <div className="route-meta">
                <span>2h 50m</span>
                <span>9 seats left</span>
              </div>
              <div className="route-foot">
                <div className="route-price">KES 800 <span>/seat</span></div>
                <button className="route-cta">Book now</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="steps">
        <div className="container">
          <div className="section-head">
            <span className="section-eyebrow">How it works</span>
            <h2>Book your seat in three steps</h2>
            <p>No queues, no paperwork — just a smooth path from search to seat.</p>
          </div>
          <div className="step-row">
            <div className="step">
              <div className="step-num">1</div>
              <h3>Search your route</h3>
              <p>Pick your departure, destination and travel date to see live buses.</p>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <h3>Choose your seat</h3>
              <p>Compare times and coaches, then pick the exact seat you want.</p>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <h3>Pay & travel</h3>
              <p>Pay securely with M-Pesa or card and get your ticket instantly.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials">
        <div className="container">
          <div className="section-head">
            <span className="section-eyebrow">Traveler stories</span>
            <h2>Trusted across the country</h2>
            <p>Real reviews from riders who've made Posta Kenya part of their journey.</p>
          </div>
          <div className="t-grid">
            <div className="t-card">
              <div className="t-stars">★★★★★</div>
              <p className="quote">Booked my Nairobi to Mombasa ticket in under two minutes. The seat was exactly as shown and the bus left right on time.</p>
              <div className="t-person">
                <div className="t-avatar" style={{ background: "var(--red)" }}>WM</div>
                <div>
                  <div className="name">Wanjiru M.</div>
                  <div className="role">Nairobi → Mombasa</div>
                </div>
              </div>
            </div>
            <div className="t-card">
              <div className="t-stars">★★★★★</div>
              <p className="quote">Support team helped me rebook after I missed my slot, no hassle at all. This is now my default way to travel upcountry.</p>
              <div className="t-person">
                <div className="t-avatar" style={{ background: "var(--blue)" }}>OK</div>
                <div>
                  <div className="name">Otieno K.</div>
                  <div className="role">Nairobi → Kisumu</div>
                </div>
              </div>
            </div>
            <div className="t-card">
              <div className="t-stars">★★★★★</div>
              <p className="quote">Clean coaches, comfortable legroom and a driver who actually kept to the schedule. Couldn't ask for more on a long ride.</p>
              <div className="t-person">
                <div className="t-avatar" style={{ background: "var(--navy)" }}>AN</div>
                <div>
                  <div className="name">Amina N.</div>
                  <div className="role">Nakuru → Eldoret</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div>
          <h2>Your next journey is one search away</h2>
          <p>Join thousands of travelers who book with Posta Kenya every day.</p>
        </div>
        <button className="btn-white" type="button" onClick={() => document.getElementById("from")?.scrollIntoView({ behavior: "smooth", block: "center" })}>
          Book your ticket
        </button>
      </section>

      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <div className="footer-brand-head">
              <div className="logo-badge">PK</div>
              <div>
                <div className="footer-brand-name">POSTA <span>KENYA</span></div>
              </div>
            </div>
            <p>Connecting Kenya, one journey at a time. Safe, comfortable and reliable bus travel across 47 counties.</p>
            <div className="foot-social">
              <a href="#" aria-label="Facebook">F</a>
              <a href="#" aria-label="Twitter">T</a>
              <a href="#" aria-label="Instagram">I</a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <a href="#">About us</a>
            <a href="#">Careers</a>
            <a href="#">Newsroom</a>
            <a href="#">Partners</a>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <a href="#">Help center</a>
            <a href="#">Refunds</a>
            <a href="#">Track ticket</a>
            <a href="#">Terms of use</a>
          </div>
          <div className="footer-col">
            <h4>Destinations</h4>
            <a href="#">Nairobi</a>
            <a href="#">Mombasa</a>
            <a href="#">Kisumu</a>
            <a href="#">Eldoret</a>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <a href="#">Posta House, Kenyatta Ave, Nairobi</a>
            <a href="#">0800 220 220</a>
            <a href="#">hello@postakenya.co.ke</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Posta Kenya. All rights reserved.</span>
          <div className="footer-legal">
            <a href="#">Privacy policy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
