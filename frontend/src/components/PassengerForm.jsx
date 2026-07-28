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
        />
      </div>
      <div className="field">
        <label htmlFor="customerPhone">Phone number</label>
        <input
          id="customerPhone"
          value={customer.customerPhone}
          onChange={update("customerPhone")}
          placeholder="07XX XXX XXX"
          autoComplete="tel"
          inputMode="tel"
        />
      </div>
      <div className="field">
        <label htmlFor="customerIdNumber">ID number</label>
        <input
          id="customerIdNumber"
          value={customer.customerIdNumber}
          onChange={update("customerIdNumber")}
          placeholder="National ID"
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
