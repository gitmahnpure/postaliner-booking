import { Link } from "react-router-dom";
import "../components/Page.css";
import "./NotFound.css";

function NotFound() {
  return (
    <div className="page">
      <div className="not-found">
        <h1 className="not-found-code">404</h1>
        <p className="not-found-desc">Page not found</p>
        <p className="not-found-text">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary">Go back home</Link>
      </div>
    </div>
  );
}

export default NotFound;
