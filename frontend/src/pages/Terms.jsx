import "../components/Page.css";
import "./Terms.css";

function Terms() {
  return (
    <div className="page">
      <div className="page-content">
        <h1 className="page-title">Terms of service</h1>
        <div className="prose">
          <section className="page-section">
            <p>
              These terms govern your use of the Posta Kenya Booking platform. By accessing or using
              this service, you agree to be bound by these terms.
            </p>
          </section>

          <section className="page-section">
            <h2>Use of service</h2>
            <p>
              You may use this platform solely for the purpose of booking bus tickets and managing
              your travel arrangements. You agree not to misuse the service for any unlawful purpose
              or in any way that disrupts the experience of other users.
            </p>
          </section>

          <section className="page-section">
            <h2>Booking &amp; payment</h2>
            <p>
              All bookings are subject to availability. Prices are quoted in Kenyan Shillings (KES)
              and include all applicable taxes unless stated otherwise. Payment must be made in full
              at the time of booking to confirm your reservation.
            </p>
          </section>

          <section className="page-section">
            <h2>Cancellations &amp; refunds</h2>
            <p>
              Cancellations made more than 24 hours before departure receive a full refund.
              Cancellations between 12 and 24 hours incur a 50% fee. No refunds are issued within
              12 hours of departure. Refunds are processed within 5&ndash;7 business days.
            </p>
          </section>

          <section className="page-section">
            <h2>Liability</h2>
            <p>
              Posta Kenya Booking acts as an intermediary between passengers and transport
              providers. We are not liable for delays, cancellations, or any losses arising from
              circumstances beyond our reasonable control, including but not limited to weather
              conditions, road closures, or mechanical issues.
            </p>
          </section>

          <section className="page-section">
            <h2>Changes to terms</h2>
            <p>
              We reserve the right to update these terms at any time. Continued use of the service
              after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="page-section">
            <p className="terms-date">Last updated: January 2026</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Terms;
