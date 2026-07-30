import "../components/Page.css";
import "./Contact.css";

function Contact() {
  return (
    <div className="page">
      <div className="page-content">
        <h1 className="page-title">Contact us</h1>
        <div className="contact-grid">
          <div className="prose">
            <section className="page-section">
              <h2>Get in touch</h2>
              <p>
                We&apos;d love to hear from you. Whether you have a question about your booking,
                need help planning a trip, or just want to say hello — reach out.
              </p>
              <ul>
                <li>
                  <strong>Address:</strong><br />
                  Posta House, Kenyatta Ave<br />
                  Nairobi, Kenya
                </li>
                <li>
                  <strong>Phone:</strong><br />
                  <a href="tel:0800220220">0800 220 220</a>
                </li>
                <li>
                  <strong>Email:</strong><br />
                  <a href="mailto:hello@postakenya.co.ke">hello@postakenya.co.ke</a>
                </li>
              </ul>
            </section>
          </div>

          <div className="contact-form-card">
            <h3>Send us a message</h3>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="field">
                <label htmlFor="contactName">Your name</label>
                <input id="contactName" type="text" placeholder="Jane Wanjiru" />
              </div>
              <div className="field">
                <label htmlFor="contactEmail">Email address</label>
                <input id="contactEmail" type="email" placeholder="jane@example.com" />
              </div>
              <div className="field">
                <label htmlFor="contactMessage">Message</label>
                <textarea id="contactMessage" rows="5" placeholder="How can we help?" />
              </div>
              <button type="submit" className="btn btn-primary">Send message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
