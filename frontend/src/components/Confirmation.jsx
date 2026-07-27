export default function Confirmation({ booking, onNewBooking, paymentMethod }) {
  const barcodeBars = Array.from(booking.reference).map((ch, i) => {
    const height = 12 + ((ch.charCodeAt(0) * (i + 3)) % 30);
    return <span key={i} style={{ height: `${height}px` }} />;
  });

  const methodLabels = {
    mpesa: "M-Pesa",
    card: "Credit/Debit Card",
    bank: "Bank Transfer",
  };

  return (
    <div className="confirm-wrap">
      <div className="confirm-badge" aria-hidden="true">&#10003;</div>
      <div className="success-banner">
        <span className="success-icon">&#10003;</span>
        <div>
          <strong>Payment received &amp; booking confirmed!</strong>
          <p>Your e-ticket has been issued. Save your reference code for boarding.</p>
        </div>
      </div>
      <p className="eyebrow" style={{ marginBottom: 4 }}>E-ticket issued</p>
      <h2>You're on the manifest, {firstName(booking.customer_name)}</h2>
      <div className="reference-code">{booking.reference}</div>
      <div className="barcode" aria-hidden="true">{barcodeBars}</div>

      <div className="summary-section">
        <h3 className="summary-title">Trip details</h3>
        <div className="summary-grid">
          <div>
            <div className="k">Route</div>
            <div className="v">{booking.schedule.routeId.replace("-", " → ")}</div>
          </div>
          <div>
            <div className="k">Travel date</div>
            <div className="v">{booking.travel_date}</div>
          </div>
          <div>
            <div className="k">Departs</div>
            <div className="v">{booking.schedule.departureTime} · {booking.schedule.coach}</div>
          </div>
          <div>
            <div className="k">Pickup</div>
            <div className="v">{booking.pickup.name}</div>
          </div>
          <div>
            <div className="k">Dropoff</div>
            <div className="v">{booking.dropoff.name}</div>
          </div>
          <div>
            <div className="k">Seats</div>
            <div className="v">{booking.seats.join(", ")}</div>
          </div>
        </div>
      </div>

      <div className="summary-section">
        <h3 className="summary-title">Payment summary</h3>
        <div className="summary-grid">
          <div>
            <div className="k">Method</div>
            <div className="v">{methodLabels[paymentMethod] || "M-Pesa"}</div>
          </div>
          <div>
            <div className="k">Status</div>
            <div className="v summary-paid">Paid</div>
          </div>
          <div>
            <div className="k">Passenger</div>
            <div className="v">{booking.customer_name}</div>
          </div>
          <div>
            <div className="k">Phone</div>
            <div className="v">{booking.customer_phone}</div>
          </div>
          <div>
            <div className="k">ID number</div>
            <div className="v">{booking.customer_id_number}</div>
          </div>
          <div>
            <div className="k">Total paid</div>
            <div className="v summary-total">KES {booking.total_fare.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="btn-row" style={{ justifyContent: "center" }}>
        <button type="button" className="btn btn-ghost" onClick={() => window.print()}>
          Print e-ticket
        </button>
        <button type="button" className="btn btn-primary" onClick={onNewBooking}>
          Book another seat
        </button>
      </div>
    </div>
  );
}

function firstName(fullName) {
  return (fullName || "").trim().split(" ")[0] || "traveller";
}
