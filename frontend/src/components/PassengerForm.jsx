import "./PassengerForm.css";

export default function PassengerForm({ customer, onChange }) {
  const update = (field) => (e) => onChange({ ...customer, [field]: e.target.value });

  return (
    <div className="field-row">
      <div className="field">
        <label htmlFor="customerName">Full name</label>
        <input
          id="customerName"
          value={customer.customerName}
          onChange={update("customerName")}
          placeholder="Jane Wanjiru"
          autoComplete="name"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="customerPhone">Phone number</label>
        <input
          id="customerPhone"
          value={customer.customerPhone}
          onChange={update("customerPhone")}
          placeholder="0712 345 678"
          autoComplete="tel"
          inputMode="tel"
          required
          pattern="(\+254|0)[\s\-]?\d{2}[\s\-]?\d{3}[\s\-]?\d{4}"
          title="Enter a valid Kenyan phone number, e.g. 0712 345 678 or +254712345678"
        />
      </div>
      <div className="field">
        <label htmlFor="customerIdNumber">ID number</label>
        <input
          id="customerIdNumber"
          value={customer.customerIdNumber}
          onChange={update("customerIdNumber")}
          placeholder="National ID"
          required
          minLength={6}
        />
      </div>
      <div className="field">
        <label htmlFor="customerEmail">Email (optional)</label>
        <input
          id="customerEmail"
          type="email"
          value={customer.customerEmail}
          onChange={update("customerEmail")}
          placeholder="jane@example.com"
          autoComplete="email"
        />
      </div>
    </div>
  );
}
