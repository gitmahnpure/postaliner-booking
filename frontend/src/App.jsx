import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "./api";
import TripBoard from "./components/TripBoard";
import SeatMap from "./components/SeatMap";
import PassengerForm from "./components/PassengerForm";
import Confirmation from "./components/Confirmation";
import BookingHistory from "./components/BookingHistory";

const STEPS = [
  { key: "plan", label: "Plan the trip" },
  { key: "departure", label: "Choose departure" },
  { key: "seats", label: "Pick seats" },
  { key: "details", label: "Passenger details" },
  { key: "payment", label: "M-Pesa payment" },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const [locations, setLocations] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [routeId, setRouteId] = useState("");
  const [pickupId, setPickupId] = useState("");
  const [dropoffId, setDropoffId] = useState("");
  const [travelDate, setTravelDate] = useState(todayISO());

  const [scheduleId, setScheduleId] = useState(null);
  const [seatData, setSeatData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const [customer, setCustomer] = useState({
    customerName: "",
    customerPhone: "",
    customerIdNumber: "",
    customerEmail: "",
  });

  const [step, setStep] = useState("plan");
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(null);
  const [activeTab, setActiveTab] = useState("book");
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("postliner_history") || "[]"); }
    catch { return []; }
  });
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(null); // null | "sending" | "waiting" | "success" | "failed"
  const [paymentMethod, setPaymentMethod] = useState("mpesa"); // "mpesa" | "card" | "bank"
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  useEffect(() => {
    localStorage.setItem("postliner_history", JSON.stringify(history));
  }, [history]);

  function showToast(message) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  function deleteBooking(idx) {
    setHistory((prev) => prev.filter((_, i) => i !== idx));
    showToast("Booking deleted");
  }

  // Initial reference data.
  useEffect(() => {
    api.getLocations().then(setLocations).catch((e) => setError(e.message));
    api.getRoutes().then(setRoutes).catch((e) => setError(e.message));
  }, []);

  // Schedules for the chosen route.
  useEffect(() => {
    if (!routeId) {
      setSchedules([]);
      return;
    }
    setLoadingSchedules(true);
    api
      .getSchedules(routeId)
      .then(setSchedules)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingSchedules(false));
  }, [routeId]);

  // Seat map for the chosen schedule + date.
  useEffect(() => {
    if (!scheduleId || !travelDate) {
      setSeatData(null);
      return;
    }
    setLoadingSeats(true);
    api
      .getSeatMap(scheduleId, travelDate)
      .then(setSeatData)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingSeats(false));
  }, [scheduleId, travelDate]);

  const selectedSchedule = schedules.find((s) => s.id === scheduleId);

  const fareTotal = useMemo(() => {
    if (!selectedSchedule) return 0;
    return selectedSchedule.fare * selectedSeats.length;
  }, [selectedSchedule, selectedSeats]);

  const planComplete = routeId && pickupId && dropoffId && travelDate;

  function goToDeparture() {
    setError("");
    if (!planComplete) {
      setError("Choose a journey, pickup, dropoff and travel date first.");
      return;
    }
    setStep("departure");
  }

  function chooseSchedule(schedule) {
    setError("");
    setScheduleId(schedule.id);
    setSelectedSeats([]);
    setStep("seats");
  }

  function toggleSeat(n) {
    setSelectedSeats((prev) => (prev.includes(n) ? prev.filter((s) => s !== n) : [...prev, n]));
  }

  function goToDetails() {
    setError("");
    if (selectedSeats.length === 0) {
      setError("Select at least one seat to continue.");
      return;
    }
    setStep("details");
  }

  function goToPayment() {
    setError("");
    if (!customer.customerName || !customer.customerPhone || !customer.customerIdNumber) {
      setError("Name, phone and ID number are required.");
      return;
    }
    setPaymentStatus(null);
    setMpesaPhone(customer.customerPhone);
    setStep("payment");
  }

  function simulateMpesaPayment() {
    setError("");
    if (paymentMethod === "mpesa") {
      const phone = mpesaPhone.replace(/\s/g, "");
      if (!/^254\d{9}$/.test(phone)) {
        setError("Enter a valid Safaricom number (254XXXXXXXXX).");
        return;
      }
    } else if (paymentMethod === "card") {
      if (cardNumber.replace(/\s/g, "").length < 16) {
        setError("Enter a valid card number.");
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        setError("Enter a valid expiry date (MM/YY).");
        return;
      }
      if (cardCvv.length < 3) {
        setError("Enter a valid CVV.");
        return;
      }
    }
    setPaymentStatus("sending");
    setTimeout(() => {
      setPaymentStatus("waiting");
      setTimeout(() => {
        setPaymentStatus("success");
        setTimeout(() => submitBooking(), 1000);
      }, paymentMethod === "mpesa" ? 3000 : 2000);
    }, 1500);
  }

  async function submitBooking() {
    setError("");
    if (!customer.customerName || !customer.customerPhone || !customer.customerIdNumber) {
      setError("Name, phone and ID number are required.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await api.createBooking({
        scheduleId,
        travelDate,
        pickupId,
        dropoffId,
        seats: selectedSeats,
        ...customer,
      });
      setBooking(result);
      setHistory((prev) => [{ ...result, bookedAt: new Date().toISOString() }, ...prev]);
      setStep("done");
    } catch (e) {
      setError(e.message);
      // Refresh seat map in case someone else grabbed a seat meanwhile.
      api.getSeatMap(scheduleId, travelDate).then(setSeatData).catch(() => {});
    } finally {
      setSubmitting(false);
    }
  }

  function startNewBooking() {
    setBooking(null);
    setScheduleId(null);
    setSeatData(null);
    setSelectedSeats([]);
    setCustomer({ customerName: "", customerPhone: "", customerIdNumber: "", customerEmail: "" });
    setPaymentStatus(null);
    setMpesaPhone("");
    setStep("plan");
  }

  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const stepperRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({});

  useEffect(() => {
    if (!stepperRef.current) return;
    const items = stepperRef.current.querySelectorAll(".step-item");
    const activeIdx = step === "done" ? STEPS.length - 1 : stepIndex;
    if (items[activeIdx]) {
      const item = items[activeIdx];
      const dot = item.querySelector(".step-dot");
      const top = dot.offsetTop + 2;
      const height = dot.offsetHeight - 4;
      setIndicatorStyle({ top: `${top}px`, height: `${height}px`, opacity: 1 });
    }
  }, [stepIndex, step]);

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand">
          <div className="brand-mark">P</div>
          <div className="brand-text">
            <div className="brand-name">Postliner</div>
            <div className="brand-tag">Overnight coach reservations</div>
          </div>
        </div>
        <div className="route-clock">
          Busia <strong>&#8596;</strong> Nairobi
          <br />
          booking desk open 24/7
        </div>
      </header>

      <nav className="tab-bar">
        <button
          type="button"
          className={`tab-btn${activeTab === "book" ? " active" : ""}`}
          onClick={() => setActiveTab("book")}
        >
          Book a trip
        </button>
        <button
          type="button"
          className={`tab-btn${activeTab === "history" ? " active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          Booking history
          {history.length > 0 && <span className="tab-badge">{history.length}</span>}
        </button>
      </nav>

      {activeTab === "book" && <DepartureTicker schedules={tickerSchedules(schedules)} />}

      {activeTab === "book" && (
      <div className="layout">
        <aside className="side-panel">
          <div className="stepper" ref={stepperRef}>
            <div className="stepper-track" style={indicatorStyle} />
            <h3>Booking steps</h3>
            {STEPS.map((s, i) => (
              <div
                key={s.key}
                className={`step-item${i < stepIndex || step === "done" ? " done" : i === stepIndex ? " active" : ""}`}
              >
                <span className="step-dot">{i < stepIndex || step === "done" ? "✓" : i + 1}</span>
                <span className="step-label">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="help-card">
            <strong>Good to know:</strong> children above 6 years need their own reserved seat.
            Large luggage may attract an extra charge from our boarding officials.
          </div>
        </aside>

        <main>
          {error && <div className="banner-error">{error}</div>}

          <section className="ticket">
            <div className="ticket-head">
              <div>
                <div className="eyebrow">{ticketEyebrow(step)}</div>
                <h2>{ticketTitle(step)}</h2>
              </div>
              {selectedSchedule && step !== "done" && (
                <div className="fare-preview">
                  <div className="label">Running total</div>
                  <div className="amount">KES {fareTotal.toLocaleString()}</div>
                </div>
              )}
            </div>

            <div className="tear" />

            <div className="ticket-body">
              {step === "plan" && (
                <PlanStep
                  locations={locations}
                  routes={routes}
                  routeId={routeId}
                  pickupId={pickupId}
                  dropoffId={dropoffId}
                  travelDate={travelDate}
                  onRouteChange={setRouteId}
                  onPickupChange={setPickupId}
                  onDropoffChange={setDropoffId}
                  onDateChange={setTravelDate}
                  onNext={goToDeparture}
                />
              )}

              {step === "departure" && (
                <div>
                  {loadingSchedules ? (
                    <p className="empty-note">Loading departures…</p>
                  ) : (
                    <TripBoard schedules={schedules} selectedId={scheduleId} onSelect={chooseSchedule} />
                  )}
                  <div className="btn-row split">
                    <button type="button" className="btn btn-ghost" onClick={() => setStep("plan")}>
                      Back
                    </button>
                  </div>
                </div>
              )}

              {step === "seats" && selectedSchedule && (
                <div>
                  {loadingSeats || !seatData ? (
                    <p className="empty-note">Loading seat map…</p>
                  ) : (
                    <SeatMap
                      totalSeats={seatData.totalSeats}
                      bookedSeats={seatData.bookedSeats}
                      selectedSeats={selectedSeats}
                      onToggleSeat={toggleSeat}
                      coach={selectedSchedule.coach}
                    />
                  )}
                  <div className="btn-row split">
                    <button type="button" className="btn btn-ghost" onClick={() => setStep("departure")}>
                      Back
                    </button>
                    <button type="button" className="btn btn-primary" onClick={goToDetails}>
                      Continue with {selectedSeats.length || 0} seat{selectedSeats.length === 1 ? "" : "s"}
                    </button>
                  </div>
                </div>
              )}

              {step === "details" && (
                <div>
                  <PassengerForm customer={customer} onChange={setCustomer} />
                  <div className="btn-row split">
                    <button type="button" className="btn btn-ghost" onClick={() => setStep("seats")}>
                      Back
                    </button>
                    <button type="button" className="btn btn-primary" onClick={goToPayment}>
                      Proceed to payment
                    </button>
                  </div>
                </div>
              )}

              {step === "payment" && (
                <div className="payment-step">
                  <div className="payment-methods">
                    <button
                      type="button"
                      className={`payment-method-btn${paymentMethod === "mpesa" ? " active" : ""}`}
                      onClick={() => setPaymentMethod("mpesa")}
                      disabled={!!paymentStatus}
                    >
                      <span className="pm-icon pm-mpesa">M</span>
                      <span className="pm-label">M-Pesa</span>
                    </button>
                    <button
                      type="button"
                      className={`payment-method-btn${paymentMethod === "card" ? " active" : ""}`}
                      onClick={() => setPaymentMethod("card")}
                      disabled={!!paymentStatus}
                    >
                      <span className="pm-icon pm-card">&#9830;</span>
                      <span className="pm-label">Card</span>
                    </button>
                    <button
                      type="button"
                      className={`payment-method-btn${paymentMethod === "bank" ? " active" : ""}`}
                      onClick={() => setPaymentMethod("bank")}
                      disabled={!!paymentStatus}
                    >
                      <span className="pm-icon pm-bank">&#9733;</span>
                      <span className="pm-label">Bank</span>
                    </button>
                  </div>

                  {!paymentStatus && (
                    <div className="mpesa-form">
                      <div className="mpesa-amount">
                        <span className="mpesa-amount-label">Amount to pay</span>
                        <span className="mpesa-amount-value">KES {fareTotal.toLocaleString()}</span>
                      </div>

                      {paymentMethod === "mpesa" && (
                        <>
                          <div className="field">
                            <label htmlFor="mpesaPhone">M-Pesa phone number</label>
                            <input
                              id="mpesaPhone"
                              type="tel"
                              placeholder="254XXXXXXXXX"
                              value={mpesaPhone}
                              onChange={(e) => setMpesaPhone(e.target.value)}
                              maxLength={12}
                            />
                          </div>
                          <p className="mpesa-hint">You will receive an STK push prompt on your phone to enter your PIN.</p>
                        </>
                      )}

                      {paymentMethod === "card" && (
                        <>
                          <div className="field">
                            <label htmlFor="cardNumber">Card number</label>
                            <input
                              id="cardNumber"
                              type="text"
                              placeholder="1234 5678 9012 3456"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              maxLength={19}
                            />
                          </div>
                          <div className="field-row">
                            <div className="field">
                              <label htmlFor="cardExpiry">Expiry</label>
                              <input
                                id="cardExpiry"
                                type="text"
                                placeholder="MM/YY"
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                maxLength={5}
                              />
                            </div>
                            <div className="field">
                              <label htmlFor="cardCvv">CVV</label>
                              <input
                                id="cardCvv"
                                type="password"
                                placeholder="***"
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value)}
                                maxLength={4}
                              />
                            </div>
                          </div>
                          <p className="mpesa-hint">Your card details are securely processed. We never store your CVV.</p>
                        </>
                      )}

                      {paymentMethod === "bank" && (
                        <>
                          <div className="bank-transfer-info">
                            <div className="bank-detail">
                              <span className="bank-label">Bank</span>
                              <span className="bank-value">Equity Bank Kenya</span>
                            </div>
                            <div className="bank-detail">
                              <span className="bank-label">Account name</span>
                              <span className="bank-value">Postliner Travel Ltd</span>
                            </div>
                            <div className="bank-detail">
                              <span className="bank-label">Account number</span>
                              <span className="bank-value bank-mono">0123456789012</span>
                            </div>
                            <div className="bank-detail">
                              <span className="bank-label">Branch</span>
                              <span className="bank-value">CBD Nairobi</span>
                            </div>
                            <div className="bank-detail">
                              <span className="bank-label">Reference</span>
                              <span className="bank-value bank-mono">BOOK-{Date.now().toString(36).toUpperCase()}</span>
                            </div>
                          </div>
                          <p className="mpesa-hint">Transfer the exact amount and include the reference. Booking confirmed after payment is received.</p>
                        </>
                      )}

                      <div className="btn-row split">
                        <button type="button" className="btn btn-ghost" onClick={() => setStep("details")}>
                          Back
                        </button>
                        <button type="button" className="btn btn-primary mpesa-pay-btn" onClick={simulateMpesaPayment}>
                          {paymentMethod === "bank" ? "I've made the transfer" : `Pay KES ${fareTotal.toLocaleString()}`}
                        </button>
                      </div>
                    </div>
                  )}

                  {paymentStatus === "sending" && (
                    <div className="mpesa-processing">
                      <div className="mpesa-spinner" />
                      <p>{paymentMethod === "mpesa" ? "Sending STK push to your phone..." : "Processing payment..."}</p>
                    </div>
                  )}

                  {paymentStatus === "waiting" && paymentMethod === "mpesa" && (
                    <div className="mpesa-processing">
                      <div className="mpesa-phone-icon">
                        <div className="mpesa-phone-screen">
                          <div className="mpesa-stk-prompt">
                            <span className="mpesa-stk-label">Safaricom M-Pesa</span>
                            <span className="mpesa-stk-amount">KES {fareTotal.toLocaleString()}</span>
                            <span className="mpesa-stk-hint">Enter PIN to confirm</span>
                            <div className="mpesa-stk-dots">
                              <span /><span /><span /><span />
                            </div>
                          </div>
                        </div>
                      </div>
                      <p>Waiting for confirmation...</p>
                    </div>
                  )}

                  {paymentStatus === "waiting" && paymentMethod !== "mpesa" && (
                    <div className="mpesa-processing">
                      <div className="mpesa-spinner" />
                      <p>Verifying your payment...</p>
                    </div>
                  )}

                  {paymentStatus === "success" && (
                    <div className="mpesa-success">
                      <div className="mpesa-success-icon">&#10003;</div>
                      <p className="mpesa-success-text">Payment received!</p>
                      <p className="mpesa-success-sub">Completing your booking...</p>
                    </div>
                  )}
                </div>
              )}

              {step === "done" && booking && (
                <Confirmation booking={booking} onNewBooking={startNewBooking} paymentMethod={paymentMethod} />
              )}
            </div>
          </section>

          <p className="footer-note">
            © {new Date().getFullYear()} Postliner demo · a fan-made rebuild, not affiliated with{" "}
            <a href="https://posta.co.ke/" target="_blank" rel="noreferrer">
              Postal Corporation of Kenya
            </a>
          </p>
        </main>
      </div>
      )}

      {activeTab === "history" && (
        <section className="ticket">
          <div className="ticket-head">
            <div>
              <div className="eyebrow">Your bookings</div>
              <h2>Booking history</h2>
            </div>
          </div>
          <div className="tear" />
          <div className="ticket-body">
            <BookingHistory
              history={history}
              onDelete={deleteBooking}
            />
          </div>
        </section>
      )}

      {activeTab === "history" && (
        <p className="footer-note">
          © {new Date().getFullYear()} Postliner demo · a fan-made rebuild, not affiliated with{" "}
          <a href="https://posta.co.ke/" target="_blank" rel="noreferrer">
            Postal Corporation of Kenya
          </a>
        </p>
      )}

      {toast && (
        <div className="toast">
          <span className="toast-icon">&#10003;</span>
          {toast}
        </div>
      )}
    </div>
  );
}

function ticketEyebrow(step) {
  switch (step) {
    case "plan":
      return "Trip planner";
    case "departure":
      return "Departure board";
    case "seats":
      return "Seat map";
    case "details":
      return "Passenger details";
    case "payment":
      return "M-Pesa payment";
    case "done":
      return "E-ticket";
    default:
      return "";
  }
}

function ticketTitle(step) {
  switch (step) {
    case "plan":
      return "Where are you headed?";
    case "departure":
      return "Choose your departure";
    case "seats":
      return "Pick your seats";
    case "details":
      return "Who's travelling?";
    case "payment":
      return "Complete payment";
    case "done":
      return "Ticket issued";
    default:
      return "";
  }
}

function PlanStep({
  locations,
  routes,
  routeId,
  pickupId,
  dropoffId,
  travelDate,
  onRouteChange,
  onPickupChange,
  onDropoffChange,
  onDateChange,
  onNext,
}) {
  return (
    <div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="journey">Journey</label>
          <select id="journey" value={routeId} onChange={(e) => onRouteChange(e.target.value)}>
            <option value="">Select journey</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="travelDate">Travel date</label>
          <input
            id="travelDate"
            type="date"
            min={todayISO()}
            value={travelDate}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="pickup">Pickup point</label>
          <select id="pickup" value={pickupId} onChange={(e) => onPickupChange(e.target.value)}>
            <option value="">Select pickup</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="dropoff">Dropoff point</label>
          <select id="dropoff" value={dropoffId} onChange={(e) => onDropoffChange(e.target.value)}>
            <option value="">Select dropoff</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="btn-row">
        <button type="button" className="btn btn-primary" onClick={onNext}>
          Show departures
        </button>
      </div>
    </div>
  );
}

function tickerSchedules(currentSchedules) {
  // Ambient ticker content: while a route isn't chosen yet, show a friendly
  // placeholder; once schedules load, show real departure times.
  if (currentSchedules.length === 0) {
    return [
      { departureTime: "07:00", coach: "Busia → Nairobi" },
      { departureTime: "18:30", coach: "Nairobi → Busia" },
      { departureTime: "19:00", coach: "Busia → Nairobi" },
      { departureTime: "20:00", coach: "Nairobi → Busia" },
    ];
  }
  return currentSchedules.map((s) => ({ departureTime: s.departureTime, coach: s.coach }));
}

function DepartureTicker({ schedules }) {
  const items = [...schedules, ...schedules]; // loop seamlessly
  return (
    <div className="board-ticker">
      <div className="board-ticker-track">
        {items.map((s, i) => (
          <span key={i}>
            <span className="dep-time">{s.departureTime}</span>
            {s.coach}
          </span>
        ))}
      </div>
    </div>
  );
}
