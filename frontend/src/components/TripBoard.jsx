export default function TripBoard({ schedules, selectedId, onSelect }) {
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
