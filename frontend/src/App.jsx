import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BookingProvider } from "./context/BookingContext";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Book from "./pages/Book";
import History from "./pages/History";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TrackTicket from "./pages/TrackTicket";
import Help from "./pages/Help";
import Destinations from "./pages/Destinations";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <BrowserRouter>
          <a href="#main" className="sr-only" style={{ position: "absolute", top: "10px", left: "10px", zIndex: 9999 }}>Skip to main content</a>
          <Navbar />
          <main id="main" className="main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/book" element={<Book />} />
              <Route path="/history" element={<History />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/track" element={<TrackTicket />} />
              <Route path="/help" element={<Help />} />
              <Route path="/destinations" element={<Destinations />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </BrowserRouter>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
