import "../components/Page.css";
import "./Help.css";

function Help() {
  return (
    <div className="page">
      <div className="page-content">
        <h1 className="page-title">Help &amp; support</h1>
        <div className="prose">
          <section className="page-section">
            <h2>How to book</h2>
            <p>
              Booking your bus ticket with Posta Kenya is simple. Use the search form on the home
              page to enter your departure city, destination, and travel date. Browse available
              schedules, select your preferred departure time, pick your seat, provide your details,
              and pay securely with M-Pesa or card. Your e-ticket will be issued immediately.
            </p>
          </section>

          <section className="page-section">
            <h2>Payment methods</h2>
            <p>
              We accept M-Pesa, credit/debit cards (Visa, Mastercard), and bank transfers. All
              payments are processed securely through encrypted channels. M-Pesa paybill number
              220220 is available for direct payments.
            </p>
          </section>

          <section className="page-section">
            <h2>Cancellation &amp; refunds</h2>
            <p>
              Cancellations made at least 24 hours before departure are eligible for a full refund.
              Cancellations between 12&ndash;24 hours incur a 50% fee. No refunds are available for
              cancellations within 12 hours of departure. To cancel, visit your booking history or
              contact our support team.
            </p>
          </section>

          <section className="page-section">
            <h2>Contact support</h2>
            <p>
              Our support team is available 24/7 to help with bookings, changes, or any questions.
            </p>
            <ul>
              <li>Phone: <a href="tel:0800220220">0800 220 220</a></li>
              <li>Email: <a href="mailto:hello@postakenya.co.ke">hello@postakenya.co.ke</a></li>
              <li>Visit: Posta House, Kenyatta Ave, Nairobi</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Help;
