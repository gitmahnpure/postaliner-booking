import { useState } from "react";
import { FaMapMarkerAlt, FaExchangeAlt, FaCalendarAlt, FaUserFriends, FaSearch, FaShieldAlt, FaChair, FaClock } from "react-icons/fa";
import "./Hero.css";

function Hero({ locations = [], onSearch }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState("1 Passenger");

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!from || !to || !date) return;
    onSearch?.({
      from,
      to,
      date,
      passengers: parseInt(passengers, 10) || 1,
    });
  };

  return (
    <section className="hero">
      <div className="hero-noise" />
      <div className="hero-grid">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="dot" />
            Now serving 47 counties across Kenya
          </div>
          <h1>
            Travel across Kenya<br />
            <span className="accent">with Posta Kenya</span>
          </h1>
          <p className="lead">
            Book your bus tickets easily and securely. Comfortable journeys connecting you to the people and places that matter.
          </p>
          <div className="trust-row">
            <div className="trust-item">
              <span className="ic"><FaShieldAlt /></span>
              Safe & secure
            </div>
            <div className="trust-item">
              <span className="ic"><FaChair /></span>
              Comfortable seats
            </div>
            <div className="trust-item">
              <span className="ic"><FaClock /></span>
              On-time service
            </div>
          </div>
        </div>

        <div className="route-visual" aria-hidden="true">
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
              <circle className="dot-alt" cx="0" cy="0" r="6" />
              <text className="city-sub" x="12" y="4">Nakuru stop</text>
            </g>
            <g className="city-pin end" transform="translate(360,320)">
              <circle className="ring delay" cx="0" cy="0" r="9" />
              <circle className="dot" cx="0" cy="0" r="7" />
              <text className="city-label" x="-70" y="-6">Mombasa</text>
              <text className="city-sub" x="-70" y="10">MSA · ARR 15:45</text>
            </g>
          </svg>
        </div>
      </div>

      <div className="search-card">
        <form className="search-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="from">From</label>
            <div className="input-wrap">
              <FaMapMarkerAlt />
              <input
                id="from"
                type="text"
                list="locations"
                placeholder="Select departure"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="button" className="swap-btn" onClick={handleSwap} aria-label="Swap origin and destination">
            <FaExchangeAlt />
          </button>

          <div className="field">
            <label htmlFor="to">To</label>
            <div className="input-wrap">
              <FaMapMarkerAlt />
              <input
                id="to"
                type="text"
                list="locations"
                placeholder="Select destination"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="date">Journey date</label>
            <div className="input-wrap">
              <FaCalendarAlt />
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="passengers">Passengers</label>
            <div className="input-wrap">
              <FaUserFriends />
              <select
                id="passengers"
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
              >
                {Array.from({ length: 6 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={`${n} Passenger${n > 1 ? "s" : ""}`}>
                    {n} Passenger{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="search-btn">
            <FaSearch />
            Search buses
          </button>
        </form>

        {locations.length > 0 && (
          <datalist id="locations">
            {locations.map((loc) => (
              <option key={loc.id} value={loc.name} />
            ))}
          </datalist>
        )}
      </div>
    </section>
  );
}

export default Hero;
