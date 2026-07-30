import { useEffect } from "react";
import "./Hero.css";

function Hero() {
  useEffect(() => {
    const seq = [
      ["a-eyebrow", 0],
      ["a-h1", 120],
      ["a-lead", 260],
      ["a-trust", 380],
      ["a-route", 200],
    ];
    seq.forEach(([id, delay]) => {
      const el = document.getElementById(id);
      if (!el) return;
      setTimeout(() => {
        el.style.transition =
          "opacity .8s cubic-bezier(.22,.68,.36,1), transform .8s cubic-bezier(.22,.68,.36,1)";
        el.style.opacity = 1;
        el.style.transform = "none";
      }, delay);
    });
  }, []);

  return (
    <section className="hero">
      <div className="hero-noise" />

      <div className="container">
        <div className="hero-grid">
          <div>
            <div className="eyebrow" id="a-eyebrow">
              <span className="dot" />
              Now serving 47 counties across Kenya
            </div>
            <h1 id="a-h1">
              Travel across Kenya<br />
              <span className="accent">with Posta Kenya</span>
            </h1>
            <p className="lead" id="a-lead">
              Book your bus tickets easily and securely. Comfortable journeys
              connecting you to the people and places that matter.
            </p>
            <div className="trust-row" id="a-trust">
              <div className="trust-item">
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 3l7 3v6c0 4.6-3 8.4-7 9.4-4-1-7-4.8-7-9.4V6l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                Safe &amp; secure
              </div>
              <div className="trust-item">
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M4 18v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6M4 18h16M6 18v2M18 18v2M6 10V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                Comfortable seats
              </div>
              <div className="trust-item">
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                On-time service
              </div>
            </div>
          </div>

          <div className="route-visual" id="a-route">
            <svg viewBox="0 0 420 380" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="routeGrad" x1="0" y1="0" x2="420" y2="380" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#3D6FE0" />
                  <stop offset="1" stopColor="#D32F2F" />
                </linearGradient>
              </defs>
              <path className="route-glow" d="M60 60 C 180 60, 120 190, 220 190 S 340 320, 360 320" />
              <path className="route-path" d="M60 60 C 180 60, 120 190, 220 190 S 340 320, 360 320" />

              <g className="city-pin" transform="translate(60,60)">
                <circle className="ring" cx="0" cy="0" r="9" />
                <circle className="dot" cx="0" cy="0" r="7" />
                <text className="city-label" x="16" y="-6">Nairobi</text>
                <text className="city-sub" x="16" y="10">NBO · DEP 07:30</text>
              </g>
              <g className="city-pin" transform="translate(220,190)">
                <circle className="dot" cx="0" cy="0" r="5.5" fill="#fff" stroke="#3D6FE0" strokeWidth="2.5" />
                <text className="city-sub" x="12" y="4" fill="#7C8AB0">Nakuru stop</text>
              </g>
              <g className="city-pin end" transform="translate(360,320)">
                <circle className="ring delay" cx="0" cy="0" r="9" />
                <circle className="dot" cx="0" cy="0" r="7" />
                <text className="city-label" x="-70" y="-6">Mombasa</text>
                <text className="city-sub" x="-70" y="10">MSA · ARR 15:45</text>
              </g>

              <g
                className="bus-marker-wrap"
                style={{ offsetPath: "path('M60 60 C 180 60, 120 190, 220 190 S 340 320, 360 320')" }}
              >
                <g className="bus-marker" transform="translate(-17,-17)">
                  <circle cx="17" cy="17" r="17" fill="#fff" />
                  <circle cx="17" cy="17" r="17" fill="none" stroke="#D32F2F" strokeWidth="1.5" />
                  <g transform="translate(6,9)">
                    <rect x="0" y="2" width="22" height="12" rx="3" fill="#D32F2F" />
                    <rect x="2" y="4" width="6" height="4.5" rx="1" fill="#fff" />
                    <rect x="9.5" y="4" width="6" height="4.5" rx="1" fill="#fff" />
                    <circle cx="5" cy="15" r="2" fill="#14274D" />
                    <circle cx="17" cy="15" r="2" fill="#14274D" />
                  </g>
                </g>
              </g>
            </svg>
          </div>
        </div>
      </div>

      <div className="mountain-layer">
        <svg viewBox="0 0 1440 180" preserveAspectRatio="none">
          <path d="M0 180 L0 90 L120 40 L240 100 L360 30 L520 110 L640 55 L760 120 L900 45 L1020 100 L1160 60 L1300 115 L1440 70 L1440 180 Z" fill="#0F1E3B" opacity="0.55" />
          <path d="M0 180 L0 130 L160 80 L300 140 L460 75 L620 145 L780 90 L940 150 L1100 95 L1260 150 L1440 110 L1440 180 Z" fill="#0F1E3B" opacity="0.85" />
        </svg>
      </div>
    </section>
  );
}

export default Hero;
