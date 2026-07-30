import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../api";
import TripBoard from "../components/TripBoard";
import SeatMap from "../components/SeatMap";
import PassengerForm from "../components/PassengerForm";
import Confirmation from "../components/Confirmation";
import "../components/Page.css";
import { useBookings } from "../context/BookingContext";

const STEP_SCHEDULE = "schedule";
const STEP_SEATS = "seats";
const STEP_PASSENGER = "passenger";
const STEP_CONFIRMATION = "confirmation";

function Book() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addBooking } = useBookings();
  const state = location.state || {};

  const [step, setStep] = useState(STEP_SCHEDULE);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [seatMap, setSeatMap] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [activeHoldId, setActiveHoldId] = useState(null);
  const [passenger, setPassenger] = useState({
    customerName: "",
    customerPhone: "",
    customerIdNumber: "",
    customerEmail: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("");
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);
  const paymentMethod = "mpesa";
  const holdRef = useRef(null);

  const routeId = state.routeId;
  const routeLabel = state.routeLabel || "";
  const travelDate = state.date || "";
  const fromName = state.from || "";
  const toName = state.to || "";

  useEffect(() => {
    if (!routeId) {
      navigate("/", { replace: true });
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.getSchedules(routeId)
      .then((data) => {
        if (cancelled) return;
        setSchedules(data);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(`Failed to load schedules: ${err.message}`);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [routeId, navigate]);

  useEffect(() => {
    if (!selectedSchedule || !travelDate) return;
    let cancelled = false;
    setLoading(true);
    setLoadingLabel("Loading seat map…");
    setError(null);
    api.getSeatMap(selectedSchedule.id, travelDate)
      .then((data) => {
        if (cancelled) return;
        setSeatMap(data);
        setSelectedSeats([]);
        setLoading(false);
        setLoadingLabel("");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(`Failed to load seat map: ${err.message}`);
        setLoading(false);
        setLoadingLabel("");
      });
    return () => { cancelled = true; };
  }, [selectedSchedule, travelDate]);

  const releaseHold = async () => {
    if (holdRef.current) {
      try {
        await api.releaseHold(holdRef.current);
      } catch {
      }
      holdRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (holdRef.current) {
        api.releaseHold(holdRef.current).catch(() => {});
      }
    };
  }, []);

  const handleSelectSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setStep(STEP_SEATS);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleSeat = async (seatNumber) => {
    const next = selectedSeats.includes(seatNumber)
      ? selectedSeats.filter((n) => n !== seatNumber)
      : [...selectedSeats, seatNumber];

    setSelectedSeats(next);
  };

  const handleSeatsContinue = async () => {
    if (selectedSeats.length === 0) {
      setError("Please select at least one seat.");
      return;
    }
    setError(null);

    try {
      const hold = await api.createHold(selectedSchedule.id, travelDate, selectedSeats);
      holdRef.current = hold.id;
      setActiveHoldId(hold.id);
    } catch {
    }

    setStep(STEP_PASSENGER);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validatePassenger = () => {
    if (!passenger.customerName.trim()) return "Full name is required.";
    if (!passenger.customerPhone.trim()) return "Phone number is required.";
    const phoneClean = passenger.customerPhone.replace(/[\s\-\(\)]/g, "");
    if (!/^(\+254\d{9}|0\d{9})$/.test(phoneClean)) {
      return "Enter a valid Kenyan phone number (e.g. 0712345678 or +254712345678).";
    }
    if (!passenger.customerIdNumber.trim()) return "ID number is required.";
    if (passenger.customerIdNumber.trim().length < 6) {
      return "ID number must be at least 6 characters.";
    }
    if (passenger.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passenger.customerEmail)) {
      return "Please enter a valid email address.";
    }
    return null;
  };

  const handlePassengerSubmit = async (e) => {
    e.preventDefault();
    const validationError = validatePassenger();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setLoading(true);
    setLoadingLabel("Processing booking…");

    const totalFare = (selectedSchedule.fare || 0) * selectedSeats.length;

    try {
      const data = await api.createBooking({
        scheduleId: selectedSchedule.id,
        travelDate: travelDate,
        seats: selectedSeats,
        customerName: passenger.customerName,
        customerPhone: passenger.customerPhone,
        customerIdNumber: passenger.customerIdNumber,
        customerEmail: passenger.customerEmail || "",
        pickupId: fromName || undefined,
        dropoffId: toName || undefined,
      });

      holdRef.current = null;

      setBooking(data);
      addBooking({
        reference: data.reference,
        travelDate: travelDate,
        schedule: {
          routeId: routeLabel,
          departureTime: selectedSchedule.departureTime,
          coach: selectedSchedule.coach,
        },
        customerName: passenger.customerName,
        seats: selectedSeats,
        totalFare: totalFare,
        bookedAt: new Date().toISOString(),
      });
      setStep(STEP_CONFIRMATION);
      setLoading(false);
      setLoadingLabel("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setLoadingLabel("");
    }
  };

  const handleBackToSeats = async () => {
    await releaseHold();
    setActiveHoldId(null);
    setStep(STEP_SEATS);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToSchedules = async () => {
    await releaseHold();
    setActiveHoldId(null);
    setSelectedSchedule(null);
    setSeatMap(null);
    setSelectedSeats([]);
    setStep(STEP_SCHEDULE);
  };

  const handleNewBooking = () => {
    setBooking(null);
    setSelectedSchedule(null);
    setSeatMap(null);
    setSelectedSeats([]);
    setActiveHoldId(null);
    holdRef.current = null;
    setPassenger({
      customerName: "",
      customerPhone: "",
      customerIdNumber: "",
      customerEmail: "",
    });
    setStep(STEP_SCHEDULE);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const bookedSeats = useMemo(() => {
    if (!seatMap) return [];
    if (seatMap.bookedSeats) return seatMap.bookedSeats;
    return Array.isArray(seatMap) ? seatMap.filter((s) => s.is_booked).map((s) => s.seat_number) : [];
  }, [seatMap]);

  if (booking) {
    return (
      <div className="page">
        <Confirmation
          booking={{
            ...booking,
            schedule: {
              routeId: routeLabel,
              departureTime: selectedSchedule.departureTime,
              coach: selectedSchedule.coach,
            },
          }}
          onNewBooking={handleNewBooking}
          paymentMethod={paymentMethod}
        />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="booking-breadcrumb">
        <span className={`crumb${step === STEP_SCHEDULE ? " active" : ""}`}>1. Choose trip</span>
        <span className="crumb-sep">/</span>
        <span className={`crumb${step === STEP_SEATS ? " active" : ""}`}>2. Pick seats</span>
        <span className="crumb-sep">/</span>
        <span className={`crumb${step === STEP_PASSENGER ? " active" : ""}`}>3. Details</span>
      </div>

      {error && (
        <div className="error-banner" role="alert">
          <strong>{
            step === STEP_SCHEDULE ? "Could not load schedules" :
            step === STEP_SEATS ? "Seat selection issue" :
            step === STEP_PASSENGER ? "Booking failed" :
            "Something went wrong"
          }</strong>
          <p>{error}</p>
        </div>
      )}

      {step === STEP_SCHEDULE && (
        <TripBoard
          schedules={schedules}
          selectedId={selectedSchedule?.id}
          onSelect={handleSelectSchedule}
          loading={loading}
        />
      )}

      {step === STEP_SEATS && selectedSchedule && (
        <div className="step-seats">
          <div className="trip-meta">
            <h3>{routeLabel}</h3>
            <p>{travelDate} · Coach {selectedSchedule.coach} · KES {selectedSchedule.fare?.toLocaleString()}</p>
          </div>

          {loading ? (
            <div className="step-loading">
              <div className="spinner" aria-label="Loading" />
              <p>{loadingLabel || "Loading seat map…"}</p>
            </div>
          ) : (
            <SeatMap
              totalSeats={seatMap?.totalSeats || 40}
              bookedSeats={bookedSeats}
              selectedSeats={selectedSeats}
              onToggleSeat={toggleSeat}
              coach={selectedSchedule.coach}
            />
          )}

          <div className="step-actions">
            <button type="button" className="btn btn-ghost" onClick={handleBackToSchedules}>
              Back
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSeatsContinue} disabled={selectedSeats.length === 0 || loading}>
              Continue ({selectedSeats.length} seat{selectedSeats.length !== 1 ? "s" : ""})
            </button>
          </div>
        </div>
      )}

      {step === STEP_PASSENGER && (
        <form className="step-passenger" onSubmit={handlePassengerSubmit}>
          <div className="trip-meta">
            <h3>Passenger details</h3>
            <p>{routeLabel} · {travelDate} · Seats: {selectedSeats.join(", ")}</p>
          </div>
          <PassengerForm customer={passenger} onChange={setPassenger} />
          <div className="step-actions">
            <button type="button" className="btn btn-ghost" onClick={handleBackToSeats}>
              Back
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? loadingLabel || "Processing…" : `Pay KES ${(selectedSchedule.fare * selectedSeats.length).toLocaleString()}`}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Book;