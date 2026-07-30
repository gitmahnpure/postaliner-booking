import "../components/Page.css";
import "./About.css";

function About() {
  return (
    <div className="page">
      <div className="page-content">
        <h1 className="page-title">About Posta Kenya</h1>
        <div className="prose">
          <section className="page-section">
            <h2>Our story</h2>
            <p>
              Posta Kenya Booking is a fan-made demonstration project that reimagines the booking
              experience for Posta Kenya — the iconic national bus service that has connected Kenyan
              communities for generations.
            </p>
            <p>
              This platform was built as a portfolio project to showcase modern web development
              techniques while paying homage to a beloved Kenyan institution. It is not affiliated
              with the official Posta Kenya or Postal Corporation of Kenya.
            </p>
          </section>

          <section className="page-section">
            <h2>Mission</h2>
            <p>
              To demonstrate how thoughtful, accessible, and performant user interfaces can transform
              everyday services. Every route, every component, and every interaction is designed with
              the traveller in mind.
            </p>
          </section>

          <section className="page-section">
            <h2>Values</h2>
            <ul>
              <li><strong>Accessibility</strong> &mdash; Inclusive design that works for everyone.</li>
              <li><strong>Performance</strong> &mdash; Fast load times and smooth interactions.</li>
              <li><strong>Clarity</strong> &mdash; Clear information, intuitive flows, no surprises.</li>
              <li><strong>Craft</strong> &mdash; Attention to detail in every line of code and pixel.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export default About;
