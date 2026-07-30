import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import CanvasScroll from "../components/CanvasScroll";
import "../components/Page.css";
import "./Home.css";
import logoSrc from "../assets/logo.png";

const DEFAULT_ROUTES = [
  {
    id: 1,
    from_location: "Nairobi",
    to_location: "Mombasa",
    departure_time: "07:00 AM",
    duration: "8h 15m",
    price: 1500,
    available_seats: 14,
    badge: "MOST POPULAR",
    type: "EXPRESS",
  },
  {
    id: 2,
    from_location: "Nairobi",
    to_location: "Kisumu",
    departure_time: "08:30 AM",
    duration: "6h 40m",
    price: 1200,
    available_seats: 22,
    badge: "SCENIC ROUTE",
    type: "VIP LINER",
  },
  {
    id: 3,
    from_location: "Nakuru",
    to_location: "Eldoret",
    departure_time: "10:15 AM",
    duration: "2h 50m",
    price: 800,
    available_seats: 9,
    badge: "HOURLY SHUTTLE",
    type: "SHUTTLE",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [from, setFrom] = useState("Nairobi");
  const [to, setTo] = useState("Mombasa");
  const [date, setDate] = useState("2026-08-01");
  const [passengers, setPassengers] = useState("1 Passenger");
  const [scrollProgress, setScrollProgress] = useState(0);

  // Active HUD hotspot expansion
  const [activeHudPin, setActiveHudPin] = useState(null);

  // Seat preview modal state
  const [selectedRouteModal, setSelectedRouteModal] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);

  const handleProgressChange = useCallback((prog) => {
    setScrollProgress(prog);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([api.getLocations().catch(() => []), api.getRoutes().catch(() => [])])
      .then(([locData, routeData]) => {
        if (cancelled) return;
        
        // Normalize locations
        const locList = Array.isArray(locData) ? locData : (locData?.results || locData?.locations || []);
        setLocations(locList);

        // Normalize routes safely
        const rtsList = Array.isArray(routeData) ? routeData : (routeData?.results || routeData?.routes || []);
        setRoutes(rtsList.length > 0 ? rtsList : DEFAULT_ROUTES);
        
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Failed to load data from server");
        setRoutes(DEFAULT_ROUTES);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const safeRoutes = Array.isArray(routes) ? routes : DEFAULT_ROUTES;
    const route = safeRoutes.find((r) => {
      const f = r.from_location?.toLowerCase() || "";
      const t = r.to_location?.toLowerCase() || "";
      return f.includes(from.toLowerCase()) && t.includes(to.toLowerCase());
    });

    const routeId = route ? route.id : 1;
    const routeLabel = route ? `${route.from_location} → ${route.to_location}` : `${from || "Nairobi"} → ${to || "Mombasa"}`;

    navigate("/book", {
      state: {
        routeId,
        routeLabel,
        date,
        from: from,
        to: to,
        passengers: parseInt(passengers, 10) || 1,
      },
    });
  };

  // Safely extract routes array
  const displayRoutes = (Array.isArray(routes) && routes.length > 0 ? routes : DEFAULT_ROUTES).slice(0, 3);

  // Compute live telemetry metrics driven by frame progress
  const currentFrame = Math.round(scrollProgress * 149) + 1;
  const simulatedSpeed = Math.min(108, Math.round(65 + Math.sin(scrollProgress * Math.PI) * 43));
  const simulatedAlt = Math.round(1680 + scrollProgress * 120);

  const stage1Active = scrollProgress < 0.33;
  const stage2Active = scrollProgress >= 0.33 && scrollProgress < 0.68;
  const stage3Active = scrollProgress >= 0.68;

  if (loading) {
    return (
      <div className="page-center dark-theme">
        <div className="spinner-glow" aria-label="Loading" />
        <p className="loading-text">Initializing Posta Kenya Executive Telemetry…</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      {error && (
        <div className="error-banner error-banner-fixed" role="alert">
          <strong>Connection issue</strong>
          <p>{error}</p>
        </div>
      )}
      {/* BACKGROUND DRIP SCROLL CANVAS ENGINE */}
      <CanvasScroll totalFrames={150} onProgressChange={handleProgressChange} />

      {/* TOP FLOATING TELEMETRY HUD BAR ($10,000 AWWWARDS DETAIL) */}
      <div className="telemetry-hud-bar">
        <div className="tele-badge">
          <span className="live-dot" /> LIVE FLEET TELEMETRY
        </div>
        <div className="tele-item">
          <span className="tele-lbl">SPEED</span>
          <span className="tele-val">{simulatedSpeed} <small>km/h</small></span>
        </div>
        <div className="tele-item">
          <span className="tele-lbl">ALTITUDE</span>
          <span className="tele-val">{simulatedAlt} <small>m</small></span>
        </div>
        <div className="tele-item desktop-only">
          <span className="tele-lbl">COORDINATES</span>
          <span className="tele-val mono">1.2921° S, 36.8219° E</span>
        </div>
        <div className="tele-item">
          <span className="tele-lbl">FRAME</span>
          <span className="tele-val mono">{String(currentFrame).padStart(3, "0")} / 150</span>
        </div>
      </div>

      {/* SCROLL PROGRESS TRACKER BAR */}
      <div className="scroll-progress-line" style={{ width: `${scrollProgress * 100}%` }} />

      {/* CONTINUOUS SCROLL TRACK */}
      <div className="scroll-track" id="scrollTrack">
        <div className="scroll-sticky">
          
          {/* STAGE 1: HERO & ADVANCED GLASS BOOKING CARD */}
          <div className={`overlay-stage ${stage1Active ? "active" : ""}`} id="stage1">
            <div className="hero-title-box">
              <div className="eyebrow">
                <span className="dot" /> 47 COUNTIES · EXECUTIVE EXPRESS NETWORK
              </div>
              <h1>
                Travel Across Kenya in <span className="accent">First-Class</span>
              </h1>
              <p>
                Experience Kenya&apos;s most sophisticated coach network with real-time telemetry, 140° reclining VIP seats, Starlink Wi-Fi, and 99.8% on-time arrivals.
              </p>
            </div>

            <div className="glass-panel search-card" id="a-search">
              <div className="field">
                <label htmlFor="fromInput">Origin</label>
                <div className="input-wrap">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.8" /></svg>
                  <input id="fromInput" type="text" list="locations" placeholder="Departure city" value={from} onChange={(e) => setFrom(e.target.value)} />
                </div>
              </div>

              <button className="swap-btn" id="swapBtn" onClick={handleSwap} aria-label="Swap origin and destination" type="button" title="Swap origin/destination">
                <svg viewBox="0 0 24 24" fill="none"><path d="M7 7h13M17 3l3 4-3 4M17 17H4M7 21l-3-4 3-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>

              <div className="field">
                <label htmlFor="toInput">Destination</label>
                <div className="input-wrap">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.8" /></svg>
                  <input id="toInput" type="text" list="locations" placeholder="Destination city" value={to} onChange={(e) => setTo(e.target.value)} />
                </div>
              </div>

              <div className="field">
                <label htmlFor="date">Travel Date</label>
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

              <button className="search-btn" id="searchBtn" type="button" onClick={handleSearch}>
                <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#fff" strokeWidth="2" /><path d="M21 21l-4.3-4.3" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
                Search Available Seats
              </button>

              {locations.length > 0 && (
                <datalist id="locations">
                  {locations.map((loc) => (
                    <option key={loc.id || loc.name} value={loc.name} />
                  ))}
                </datalist>
              )}
            </div>

            <div className="scroll-pill" onClick={() => window.scrollTo({ top: window.innerHeight * 1.2, behavior: "smooth" })}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              SCROLL TO EXPLORE LUXURY CABIN INTERIOR
            </div>
          </div>

          {/* STAGE 2: CABIN INTERIOR & INTERACTIVE HUD HOTSPOTS */}
          <div className={`overlay-stage ${stage2Active ? "active" : ""}`} id="stage2">
            <div className="hud-center-title">
              <div className="eyebrow">
                <span className="dot" /> INTERIOR ARCHITECTURE & TECH
              </div>
              <h2>Executive Cabin Experience</h2>
              <p>Hover or click any HUD beacon to inspect seat ergonomics, connectivity, and micro-climate controls.</p>
            </div>

            <div className="hud-wrapper">
              {/* Hotspot 1 */}
              <div
                className={`hud-pin ${activeHudPin === 1 ? "expanded" : ""}`}
                style={{ top: "22%", left: "12%" }}
                onMouseEnter={() => setActiveHudPin(1)}
                onMouseLeave={() => setActiveHudPin(null)}
                onClick={() => setActiveHudPin(activeHudPin === 1 ? null : 1)}
              >
                <div className="hud-beacon">
                  <span className="beacon-core" />
                </div>
                <div className="hud-info">
                  <div className="hud-tag">SPECIFICATION 01</div>
                  <h4>140° Zero-Gravity Recline</h4>
                  <p>Plush Italian memory-foam seating with extended leg rests and lumbar support.</p>
                  {activeHudPin === 1 && (
                    <div className="hud-expanded-spec">
                      <span>Seat Pitch: 42 inches</span> · <span>Memory Foam Layer: 50mm</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Hotspot 2 */}
              <div
                className={`hud-pin ${activeHudPin === 2 ? "expanded" : ""}`}
                style={{ top: "18%", right: "14%" }}
                onMouseEnter={() => setActiveHudPin(2)}
                onMouseLeave={() => setActiveHudPin(null)}
                onClick={() => setActiveHudPin(activeHudPin === 2 ? null : 2)}
              >
                <div className="hud-beacon">
                  <span className="beacon-core" />
                </div>
                <div className="hud-info">
                  <div className="hud-tag">SPECIFICATION 02</div>
                  <h4>Starlink Gen 3 Satellite Wi-Fi</h4>
                  <p>Unthrottled 150 Mbps connectivity for video calls and 4K streaming en route.</p>
                  {activeHudPin === 2 && (
                    <div className="hud-expanded-spec">
                      <span>Bandwidth: 150 Mbps</span> · <span>Latency: 28ms</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Hotspot 3 */}
              <div
                className={`hud-pin ${activeHudPin === 3 ? "expanded" : ""}`}
                style={{ bottom: "24%", left: "16%" }}
                onMouseEnter={() => setActiveHudPin(3)}
                onMouseLeave={() => setActiveHudPin(null)}
                onClick={() => setActiveHudPin(activeHudPin === 3 ? null : 3)}
              >
                <div className="hud-beacon">
                  <span className="beacon-core" />
                </div>
                <div className="hud-info">
                  <div className="hud-tag">SPECIFICATION 03</div>
                  <h4>65W USB-C & AC Outlets</h4>
                  <p>Universal fast charging integrated directly into every individual seat armrest.</p>
                  {activeHudPin === 3 && (
                    <div className="hud-expanded-spec">
                      <span>Output: Power Delivery 3.0</span> · <span>Dual Outlets / Seat</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Hotspot 4 */}
              <div
                className={`hud-pin ${activeHudPin === 4 ? "expanded" : ""}`}
                style={{ bottom: "20%", right: "18%" }}
                onMouseEnter={() => setActiveHudPin(4)}
                onMouseLeave={() => setActiveHudPin(null)}
                onClick={() => setActiveHudPin(activeHudPin === 4 ? null : 4)}
              >
                <div className="hud-beacon">
                  <span className="beacon-core" />
                </div>
                <div className="hud-info">
                  <div className="hud-tag">SPECIFICATION 04</div>
                  <h4>Dual HEPA Micro-Climate</h4>
                  <p>99.97% air filtration cycle every 3 minutes with personal temperature dials.</p>
                  {activeHudPin === 4 && (
                    <div className="hud-expanded-spec">
                      <span>Air Refresh: 180s Cycle</span> · <span>Individual Vents</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* STAGE 3: HIGH ANGLE TRACKING & TELEMETRY */}
          <div className={`overlay-stage ${stage3Active ? "active" : ""}`} id="stage3">
            <div className="hud-center-title">
              <div className="eyebrow">
                <span className="dot" /> NATIONWIDE LINER NETWORK
              </div>
              <h2>Powering Kenya&apos;s Transit Infrastructure</h2>
              <p>Connecting major metropolitan hubs and 47 rural counties with clockwork precision.</p>
            </div>

            <div className="telemetry-grid">
              <div className="tele-card">
                <div className="num">47</div>
                <div className="label">Counties Connected</div>
              </div>
              <div className="tele-card">
                <div className="num">99.8<span>%</span></div>
                <div className="label">On-Time Reliability</div>
              </div>
              <div className="tele-card">
                <div className="num">1.2<span>M+</span></div>
                <div className="label">Annual Travelers</div>
              </div>
              <div className="tele-card">
                <div className="num">350<span>+</span></div>
                <div className="label">Daily Express Trips</div>
              </div>
            </div>

            <div className="routes-stage-box" id="routes">
              {displayRoutes.map((r) => (
                <div className="route-glass-card" key={r.id || r.from_location}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span className="mono" style={{ fontSize: "11px", color: "var(--gold)" }}>
                      RT-{String(r.id || 1).padStart(3, "0")} · {r.type || "EXPRESS"}
                    </span>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#4ADE80" }}>
                      {r.available_seats || 14} Seats Left
                    </span>
                  </div>
                  <h3 style={{ fontSize: "21px", marginBottom: "8px", color: "#fff" }}>
                    {r.from_location} → {r.to_location}
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--slate-light)", marginBottom: "18px" }}>
                    Departs {r.departure_time || "07:00 AM"} · Estimated {r.duration || "8h"}
                  </p>
                  <div style={{ display: "flex", justify: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: "11px", color: "var(--slate)", display: "block" }}>FARE PER SEAT</span>
                      <span style={{ fontSize: "20px", fontWeight: "800", color: "var(--gold)" }}>
                        KES {(r.price || 1500).toLocaleString()}
                      </span>
                    </div>
                    <button
                      className="btn btn-solid"
                      style={{ padding: "10px 18px", fontSize: "13.5px" }}
                      type="button"
                      onClick={() => setSelectedRouteModal(r)}
                    >
                      Instant Seat Map
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* QUICK SEAT SELECTION GLASS MODAL */}
      {selectedRouteModal && (
        <div className="modal-backdrop" onClick={() => setSelectedRouteModal(null)}>
          <div className="glass-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" type="button" onClick={() => setSelectedRouteModal(null)}>×</button>
            <div className="modal-header">
              <span className="eyebrow" style={{ marginBottom: "8px" }}><span className="dot" /> EXECUTIVE LINER SEAT MAP</span>
              <h2>{selectedRouteModal.from_location} → {selectedRouteModal.to_location}</h2>
              <p>Departure: {selectedRouteModal.departure_time || "07:00 AM"} · Fare: KES {(selectedRouteModal.price || 1500).toLocaleString()}</p>
            </div>

            <div className="modal-seat-grid">
              {Array.from({ length: 16 }, (_, i) => i + 1).map((seatNo) => {
                const isTaken = [3, 7, 12].includes(seatNo);
                const isSelected = selectedSeat === seatNo;
                return (
                  <button
                    key={seatNo}
                    type="button"
                    disabled={isTaken}
                    className={`seat-btn ${isTaken ? "taken" : ""} ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedSeat(seatNo)}
                  >
                    <span className="seat-num">{seatNo}</span>
                    <span className="seat-type">{seatNo <= 4 ? "VIP" : "STD"}</span>
                  </button>
                );
              })}
            </div>

            <div className="modal-footer">
              <div className="selected-info">
                {selectedSeat ? (
                  <span>Selected Seat: <strong>#{selectedSeat}</strong> ({selectedSeat <= 4 ? "VIP Recliner" : "Standard Seat"})</span>
                ) : (
                  <span>Select an available seat above to proceed</span>
                )}
              </div>
              <button
                className="btn btn-solid"
                type="button"
                disabled={!selectedSeat}
                onClick={() => {
                  setFrom(selectedRouteModal.from_location);
                  setTo(selectedRouteModal.to_location);
                  handleSearch();
                }}
              >
                Confirm &amp; Proceed to Checkout →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTIONS BELOW SCROLL TRACK */}
      <section className="features" id="features">
        <div className="container">
          <div className="sec-head">
            <span className="sec-eyebrow">The Posta Standard</span>
            <h2>Built for the Kenyan road, mile after mile</h2>
            <p>Every fleet, route and support line is designed around one thing — getting you there safely, on time, in absolute comfort.</p>
          </div>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v6c0 4.6-3 8.4-7 9.4-4-1-7-4.8-7-9.4V6l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <h3>Guaranteed Departure</h3>
              <p>Monitored by GPS fleet telematics so your coach leaves on the second.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M4 18v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6M4 18h16M6 18v2M18 18v2M6 10V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <h3>Executive VIP Seating</h3>
              <p>Extended 42-inch seat pitch with dual footrests and plush leather memory foam.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" /><path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <h3>Real-Time Live Telemetry</h3>
              <p>Track your bus speed, ETA, and precise location on map from your phone.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M3 12a9 9 0 1 1 9 9M3 12l3-3M3 12l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="1.4" fill="currentColor" /></svg></div>
              <h3>24/7 Concierge Service</h3>
              <p>Personalized traveler support ready to handle luggage, seat changes &amp; queries.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="steps">
        <div className="container">
          <div className="sec-head">
            <span className="sec-eyebrow">How It Works</span>
            <h2>Book your seat in 3 simple steps</h2>
          </div>
          <div className="step-row">
            <div className="step">
              <div className="step-num">1</div>
              <h3>Select Your Route</h3>
              <p>Pick your origin, destination, and departure date across 47 counties.</p>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <h3>Choose Preferred Seat</h3>
              <p>Inspect the live bus floor plan and reserve your exact VIP seat.</p>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <h3>Pay &amp; Travel</h3>
              <p>Pay instantly with M-Pesa or Card and get your digital QR pass via SMS.</p>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo">
                <div className="logo-badge">
                  <img src={logoSrc} alt="Posta Kenya Logo" className="logo-img" />
                </div>
                <div className="logo-text"><span className="brand">POSTA <span>KENYA</span></span></div>
              </div>
              <p>Connecting Kenya, one luxury journey at a time. Safe, comfortable and reliable bus travel across 47 counties.</p>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="/about">About us</a>
              <a href="#">Careers</a>
              <a href="#">Newsroom</a>
            </div>
            <div className="footer-col">
              <h4>Support</h4>
              <a href="/help">Help center</a>
              <a href="#">Refunds</a>
              <a href="/track">Track ticket</a>
            </div>
            <div className="footer-col">
              <h4>Destinations</h4>
              <a href="/destinations">Nairobi</a>
              <a href="/destinations">Mombasa</a>
              <a href="/destinations">Kisumu</a>
            </div>
            <div className="footer-col">
              <h4>Contact</h4>
              <p>Posta House, Kenyatta Ave, Nairobi</p>
              <p>0800 220 220</p>
              <p>hello@postakenya.co.ke</p>
            </div>
          </div>
          <div className="footer-bottom">
            <span>&copy; 2026 Posta Kenya. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
