import "../components/Page.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import Hero from "../components/Hero";

function Home() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([api.getLocations(), api.getRoutes()])
      .then(([loc, rts]) => {
        if (cancelled) return;
        setLocations(loc);
        setRoutes(rts);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleSearch = (values) => {
    const route = routes.find((r) => {
      const from = r.from_location?.toLowerCase() || "";
      const to = r.to_location?.toLowerCase() || "";
      return (
        from.includes(values.from.toLowerCase()) &&
        to.includes(values.to.toLowerCase())
      );
    });
    if (!route) {
      setError("No matching route found. Try Nairobi → Busia or Busia → Nairobi.");
      return;
    }
    navigate("/book", {
      state: {
        routeId: route.id,
        routeLabel: `${route.from_location} → ${route.to_location}`,
        date: values.date,
        passengers: values.passengers,
      },
    });
  };

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" aria-label="Loading" />
        <p className="loading-text">Loading routes…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-center">
        <div className="error-banner">
          <strong>Unable to load routes</strong>
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <Hero locations={locations} onSearch={handleSearch} />
      <section className="home-info" aria-label="About">
        <h2>Travel across Kenya in comfort</h2>
        <p>Book your seat on Postliner coaches. Choose your journey, pick your seats, and get your e-ticket instantly.</p>
      </section>
    </div>
  );
}

export default Home;
