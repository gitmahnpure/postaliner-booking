import { useState, useEffect, useMemo } from "react";
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
  const [passenger, setPassenger] = useState({
    customerName: "",
    customerPhone: "",
    customerIdNumber: "",
    customerEmail: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);
  const paymentMethod = "mpesa";

  const routeId = state.routeId;
  const routeLabel = state.routeLabel || "";
  const travelDate = state.date || "";

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
        setError(err.message);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [routeId, navigate]);

  useEffect(() => {
    if (!selectedSchedule || !travelDate) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.getSeatMap(selectedSchedule.id, travelDate)
      .then((data) => {
        if (cancelled) return;
        setSeatMap(data);
        setSelectedSeats([]);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedSchedule, travelDate]);

  const handleSelectSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setStep(STEP_SEATS);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleSeat = (seatNumber) => {
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((n) => n !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleSeatsContinue = () => {
    if (selectedSeats.length === 0) {
      setError("Please select at least one seat.");
      return;
    }
    setError(null);
    setStep(STEP_PASSENGER);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validatePassenger = () => {
    if (!passenger.customerName.trim()) return "Full name is required.";
    if (!passenger.customerPhone.trim()) return "Phone number is required.";
    if (!passenger.customerIdNumber.trim()) return "ID number is required.";
    if (passenger.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passenger.customerEmail)) {
      return "Please enter a valid email address.";
    }
    return null;
  };

  const handlePassengerSubmit = (e) => {
    e.preventDefault();
    const validationError = validatePassenger();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setLoading(true);

    const totalFare = (selectedSchedule.fare || 0) * selectedSeats.length;

    api.createBooking({
      schedule: selectedSchedule.id,
      travel_date: travelDate,
      seats: selectedSeats,
      customer_name: passenger.customerName,
      customer_phone: passenger.customerPhone,
      customer_id_number: passenger.customerIdNumber,
      customer_email: passenger.customerEmail || "",
      total_fare: totalFare,
      pickup: { name: state.from || "" },
      dropoff: { name: state.to || "" },
    })
      .then((data) => {
        setBooking(data);
        addBooking({
          reference: data.reference,
          travel_date: travelDate,
          schedule: {
            routeId: routeLabel,
            departureTime: selectedSchedule.departureTime,
            coach: selectedSchedule.coach,
          },
          customer_name: passenger.customerName,
          seats: selectedSeats,
          total_fare: totalFare,
          bookedAt: new Date().toISOString(),
        });
        setStep(STEP_CONFIRMATION);
        setLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleNewBooking = () => {
    setBooking(null);
    setSelectedSchedule(null);
    setSelectedSeats([]);
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
          <strong>Something went wrong</strong>
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
          <SeatMap
            totalSeats={40}
            bookedSeats={bookedSeats}
            selectedSeats={selectedSeats}
            onToggleSeat={toggleSeat}
            coach={selectedSchedule.coach}
          />
          <div className="step-actions">
            <button type="button" className="btn btn-ghost" onClick={() => { setSelectedSchedule(null); setStep(STEP_SCHEDULE); }}>
              Back
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSeatsContinue} disabled={selectedSeats.length === 0}>
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
            <button type="button" className="btn btn-ghost" onClick={() => setStep(STEP_SEATS)}>
              Back
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Processing…" : `Pay KES ${(selectedSchedule.fare * selectedSeats.length).toLocaleString()}`}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Book;
