import "./TripBoard.css";

export default function TripBoard({ schedules, selectedId, onSelect, loading }) {
  if (loading) {
    return (
      <div className="trip-list">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="trip-row" style={{ opacity: 0.5 }}>
            <span className="trip-check" />
            <span>
              <span className="trip-time" style={{ width: 80, height: 18, background: 'var(--border)', borderRadius: 4, display: 'inline-block' }} />
              <br />
              <span className="trip-coach" style={{ width: 60, height: 14, background: 'var(--border)', borderRadius: 4, display: 'inline-block', marginTop: 6 }} />
            </span>
            <span className="trip-fare" style={{ width: 70, height: 18, background: 'var(--border)', borderRadius: 4, display: 'inline-block' }} />
          </div>
        ))}
      </div>
    );
  }

  if (schedules.length === 0) {
    return <p className="empty-note">No departures found for this route yet — choose a journey first.</p>;
  }

  return (
    <div className="trip-list">
      {schedules.map((s) => (
        <button
          key={s.id}
          type="button"
          className={`trip-row${selectedId === s.id ? " selected" : ""}`}
          onClick={() => onSelect(s)}
          aria-pressed={selectedId === s.id}
        >
          <span className="trip-check" aria-hidden="true" />
          <span>
            <span className="trip-time">{s.departureTime}</span>
            <br />
            <span className="trip-coach">Coach {s.coach}</span>
          </span>
          <span className="trip-fare">KES {s.fare.toLocaleString()}</span>
        </button>
      ))}
    </div>
  );
}
