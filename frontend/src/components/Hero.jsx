import { useState } from "react";
import { FaMapMarkerAlt, FaExchangeAlt, FaCalendarAlt, FaUserFriends, FaSearch } from "react-icons/fa";

function Hero({ locations = [], onSearch }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState("1 Passenger");
  const [tripType, setTripType] = useState("one-way");

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
      tripType,
    });
  };

  return (
    <div className="hero">
      <div className="hero-content">
        <h1>Book your coach seat</h1>
        <p>Travel across Kenya with Postliner — safe, comfortable, and on schedule.</p>
      </div>

      <form className="booking-box" onSubmit={handleSubmit}>
        <div className="booking-row">
          <div className="field">
            <label htmlFor="from">From</label>
            <div className="input-icon">
              <FaMapMarkerAlt className="icon" />
              <input
                id="from"
                type="text"
                list="locations"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Departure city"
                required
              />
            </div>
          </div>

          <button type="button" className="swap-btn" onClick={handleSwap} aria-label="Swap origin and destination">
            <FaExchangeAlt />
          </button>

          <div className="field">
            <label htmlFor="to">To</label>
            <div className="input-icon">
              <FaMapMarkerAlt className="icon" />
              <input
                id="to"
                type="text"
                list="locations"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Arrival city"
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="date">Departure</label>
            <div className="input-icon">
              <FaCalendarAlt className="icon" />
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
            <div className="input-icon">
              <FaUserFriends className="icon" />
              <select id="passengers" value={passengers} onChange={(e) => setPassengers(e.target.value)}>
                {Array.from({ length: 6 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={`${n} Passenger${n > 1 ? "s" : ""}`}>
                    {n} Passenger{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="booking-footer">
          <div className="trip-type">
            <label>
              <input
                type="radio"
                name="trip"
                checked={tripType === "one-way"}
                onChange={() => setTripType("one-way")}
              />
              One Way
            </label>
            <label>
              <input
                type="radio"
                name="trip"
                checked={tripType === "round"}
                onChange={() => setTripType("round")}
              />
              Round Trip
            </label>
          </div>

          <input
            className="promo-input"
            type="text"
            placeholder="Promo Code (Optional)"
          />

          <button type="submit" className="search-btn">
            <FaSearch />
            Search Buses
          </button>
        </div>

        {locations.length > 0 && (
          <datalist id="locations">
            {locations.map((loc) => (
              <option key={loc.id} value={loc.name} />
            ))}
          </datalist>
        )}
      </form>
    </div>
  );
}

export default Hero;
