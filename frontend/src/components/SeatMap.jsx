import "./SeatMap.css";

export default function SeatMap({ totalSeats, bookedSeats, selectedSeats, onToggleSeat, coach }) {
  const rows = [];
  for (let i = 1; i <= totalSeats; i += 4) {
    rows.push([i, i + 1, i + 2, i + 3].filter((n) => n <= totalSeats));
  }

  return (
    <div>
      <div className="bus">
        <div className="bus-front">
          <span>{coach}</span>
          <div className="wheel-icon" aria-hidden="true" />
          <span>Front</span>
        </div>
        <div className="seat-grid" role="group" aria-label="Seat map">
          {rows.map((row, idx) => (
            <RowSeats
              key={idx}
              seats={row}
              bookedSeats={bookedSeats}
              selectedSeats={selectedSeats}
              onToggleSeat={onToggleSeat}
            />
          ))}
        </div>
      </div>
      <div className="seat-legend">
        <span><i className="dot available" />Available</span>
        <span><i className="dot selected-dot" />Selected</span>
        <span><i className="dot booked" />Booked</span>
      </div>
    </div>
  );
}

function RowSeats({ seats, bookedSeats, selectedSeats, onToggleSeat }) {
  const [a, b, c, d] = seats;
  return (
    <>
      <Seat n={a} bookedSeats={bookedSeats} selectedSeats={selectedSeats} onToggleSeat={onToggleSeat} />
      <Seat n={b} bookedSeats={bookedSeats} selectedSeats={selectedSeats} onToggleSeat={onToggleSeat} />
      <div className="aisle-gap" aria-hidden="true" />
      <Seat n={c} bookedSeats={bookedSeats} selectedSeats={selectedSeats} onToggleSeat={onToggleSeat} />
      <Seat n={d} bookedSeats={bookedSeats} selectedSeats={selectedSeats} onToggleSeat={onToggleSeat} />
    </>
  );
}

function Seat({ n, bookedSeats, selectedSeats, onToggleSeat }) {
  if (!n) return <div />;
  const isBooked = bookedSeats.includes(n);
  const isSelected = selectedSeats.includes(n);
  return (
    <button
      type="button"
      className={`seat${isSelected ? " selected" : ""}`}
      disabled={isBooked}
      onClick={() => onToggleSeat(n)}
      aria-pressed={isSelected}
      aria-label={`Seat ${n}${isBooked ? ", booked" : isSelected ? ", selected" : ", available"}`}
      title={isBooked ? `Seat ${n} — already booked` : `Seat ${n}`}
    >
      {n}
    </button>
  );
}
