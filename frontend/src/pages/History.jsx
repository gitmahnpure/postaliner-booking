import "../components/Page.css";
import { useBookings } from "../context/BookingContext";
import BookingHistory from "../components/BookingHistory";

function History() {
  const { bookings, removeBooking } = useBookings();

  return (
    <div className="page">
      <h1 className="page-title">My bookings</h1>
      <BookingHistory history={bookings} onDelete={removeBooking} />
    </div>
  );
}

export default History;
