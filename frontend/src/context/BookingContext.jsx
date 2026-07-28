import { createContext, useContext, useState, useCallback } from "react";

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState(() => {
    try {
      const raw = localStorage.getItem("postliner_bookings");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const addBooking = useCallback((booking) => {
    setBookings((prev) => {
      const next = [booking, ...prev];
      localStorage.setItem("postliner_bookings", JSON.stringify(next));
      return next;
    });
  }, []);

  const removeBooking = useCallback((index) => {
    setBookings((prev) => {
      const next = prev.filter((_, i) => i !== index);
      localStorage.setItem("postliner_bookings", JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <BookingContext.Provider value={{ bookings, addBooking, removeBooking }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBookings must be used within BookingProvider");
  return ctx;
}
