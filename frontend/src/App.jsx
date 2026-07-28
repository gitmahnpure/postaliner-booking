import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BookingProvider } from "./context/BookingContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Book from "./pages/Book";
import History from "./pages/History";

function App() {
  return (
    <BookingProvider>
      <BrowserRouter>
        <a href="#main" className="sr-only" style={{ position: "absolute", top: "10px", left: "10px", zIndex: 9999 }}>Skip to main content</a>
        <Navbar />
        <main id="main" className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book" element={<Book />} />
            <Route path="/history" element={<History />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
    </BookingProvider>
  );
}

export default App;
