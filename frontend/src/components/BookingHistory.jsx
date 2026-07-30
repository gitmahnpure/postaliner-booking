import "./BookingHistory.css";

export default function BookingHistory({ history, onDelete }) {
  if (history.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">&#128203;</div>
        <h3>No bookings yet</h3>
        <p>Your confirmed bookings will appear here.</p>
      </div>
    );
  }

  return (
    <div className="history-list">
      {history.map((b, i) => (
        <div key={b.reference || i} className="history-card">
          <div className="history-card-header">
            <div>
              <span className="history-ref">{b.reference}</span>
              <span className="history-route">
                {(b.schedule?.routeId || "").replace(/-/g, " → ") || "—"}
              </span>
            </div>
            <div className="history-card-actions">
              <span className="history-status">Confirmed</span>
              <button
                type="button"
                className="history-delete"
                onClick={() => {
                  if (window.confirm(`Delete booking ${b.reference}? This cannot be undone.`)) {
                    onDelete(i);
                  }
                }}
                title="Remove booking"
                aria-label={`Delete booking ${b.reference}`}
              >
                &#10005;
              </button>
            </div>
          </div>
          <div className="history-card-body">
            <div className="history-detail">
              <span className="history-label">Travel date</span>
              <span className="history-value">{b.travel_date}</span>
            </div>
            <div className="history-detail">
              <span className="history-label">Departs</span>
              <span className="history-value">
                {b.schedule?.departureTime} · {b.schedule?.coach}
              </span>
            </div>
            <div className="history-detail">
              <span className="history-label">Passenger</span>
              <span className="history-value">{b.customer_name}</span>
            </div>
            <div className="history-detail">
              <span className="history-label">Seats</span>
              <span className="history-value">{b.seats?.join(", ")}</span>
            </div>
            <div className="history-detail">
              <span className="history-label">Fare</span>
              <span className="history-value history-fare">
                KES {b.total_fare?.toLocaleString()}
              </span>
            </div>
          </div>
          {b.bookedAt && (
            <div className="history-card-footer">
              Booked {new Date(b.bookedAt).toLocaleDateString("en-KE", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
