import { useState } from "react";
import { api } from "../api";
import "../components/Page.css";
import "./TrackTicket.css";

function TrackTicket() {
  const [reference, setReference] = useState("");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reference.trim()) return;
    setLoading(true);
    setError(null);
    setBooking(null);
    try {
      const data = await api.getBooking(reference.trim());
      setBooking(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Track your ticket</h1>

      <div className="track-card">
        <form onSubmit={handleSubmit} className="track-form">
          <div className="field">
            <label htmlFor="trackRef">Reference code</label>
            <input
              id="trackRef"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. PK-XXXX-XXXX"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Searching…" : "Find ticket"}
          </button>
        </form>
      </div>

      {loading && (
        <div className="track-loading">
          <div className="spinner" aria-label="Loading" />
        </div>
      )}

      {error && (
        <div className="error-banner" role="alert">
          <strong>Not found</strong>
          <p>{error}</p>
        </div>
      )}

      {booking && (
        <div className="track-result">
          <div className="track-result-header">
            <div className="track-result-icon">&#10003;</div>
            <div>
              <strong>Booking found</strong>
              <p>Reference: {booking.reference}</p>
            </div>
          </div>

          <div className="summary-section">
            <h3 className="summary-title">Trip details</h3>
            <div className="summary-grid">
              <div>
                <div className="k">Route</div>
                <div className="v">{booking.route || `${booking.from_location || "—"} → ${booking.to_location || "—"}`}</div>
              </div>
              <div>
                <div className="k">Travel date</div>
                <div className="v">{booking.travel_date}</div>
              </div>
              <div>
                <div className="k">Departure</div>
                <div className="v">{booking.departure_time || booking.schedule?.departureTime || "—"}</div>
              </div>
              <div>
                <div className="k">Coach</div>
                <div className="v">{booking.coach || booking.schedule?.coach || "—"}</div>
              </div>
              <div>
                <div className="k">Seats</div>
                <div className="v">{Array.isArray(booking.seats) ? booking.seats.join(", ") : booking.seats || "—"}</div>
              </div>
              <div>
                <div className="k">Passenger</div>
                <div className="v">{booking.customer_name || booking.passenger_name || "—"}</div>
              </div>
              <div>
                <div className="k">Status</div>
                <div className="v summary-paid">{booking.status || "Confirmed"}</div>
              </div>
              <div>
                <div className="k">Total paid</div>
                <div className="v summary-total">KES {(booking.total_fare || 0).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrackTicket;
