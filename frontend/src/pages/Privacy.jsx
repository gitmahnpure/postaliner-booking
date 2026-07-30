import "../components/Page.css";
import "./Privacy.css";

function Privacy() {
  return (
    <div className="page">
      <div className="page-content">
        <h1 className="page-title">Privacy policy</h1>
        <div className="prose">
          <section className="page-section">
            <p>
              Your privacy is important to us. This policy outlines how we collect, use, and protect
              your personal information when you use the Posta Kenya Booking platform.
            </p>
          </section>

          <section className="page-section">
            <h2>Information we collect</h2>
            <p>
              When you make a booking, we collect your name, phone number, email address, and ID
              number. We also store basic booking details such as your travel date, route, and seat
              selections. Usage data such as page views and interactions may be collected
              anonymously to improve the service.
            </p>
          </section>

          <section className="page-section">
            <h2>How we use your data</h2>
            <p>
              Your information is used to process bookings, communicate travel updates, provide
              customer support, and improve our service. We do not sell or share your personal data
              with third parties for marketing purposes.
            </p>
          </section>

          <section className="page-section">
            <h2>Data storage &amp; security</h2>
            <p>
              Booking data is stored locally in your browser using localStorage for demo purposes.
              In a production environment, data would be encrypted and stored securely on protected
              servers with access controls.
            </p>
          </section>

          <section className="page-section">
            <h2>Your rights</h2>
            <p>
              You may request access to, correction of, or deletion of your personal data at any
              time by contacting our support team. You can also clear your booking history through
              the platform interface.
            </p>
          </section>

          <section className="page-section">
            <h2>Contact</h2>
            <p>
              If you have questions about this policy, please contact us at{" "}
              <a href="mailto:hello@postakenya.co.ke">hello@postakenya.co.ke</a>.
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

export default Privacy;
