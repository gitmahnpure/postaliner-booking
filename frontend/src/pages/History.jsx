import { useState, useEffect } from "react";
import { api } from "../api";
import "../components/Page.css";
import { useBookings } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import BookingHistory from "../components/BookingHistory";

function History() {
  const { bookings, removeBooking } = useBookings();
  const { token, isAuthenticated } = useAuth();
  const [serverBookings, setServerBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api.getMyBookings(token)
      .then((data) => {
        setServerBookings(Array.isArray(data) ? data : []);
      })
      .catch(() => {
      })
      .finally(() => setLoading(false));
  }, [token]);

  const allBookings = [...serverBookings, ...bookings].filter(
    (b, i, arr) => arr.findIndex((x) => x.reference === b.reference) === i
  );

  return (
    <div className="page">
      <h1 className="page-title">My bookings</h1>
      {loading && <p className="loading-text" style={{ textAlign: "center" }}>Syncing bookings…</p>}
      <BookingHistory history={allBookings} onDelete={removeBooking} />
      {!isAuthenticated && (
        <p style={{ textAlign: "center", color: "var(--slate)", marginTop: 16 }}>
          <a href="/login">Log in</a> to see all your bookings across devices.
        </p>
      )}
    </div>
  );
}

export default History;