import "../components/Page.css";
import "./Destinations.css";

const destinations = [
  { name: "Nairobi", desc: "The capital city — Kenya's vibrant hub of business, culture, and transport." },
  { name: "Mombasa", desc: "Coastal gem on the Indian Ocean, famous for its beaches and historic Old Town." },
  { name: "Kisumu", desc: "Lakeside city on the shores of Lake Victoria, rich in culture and natural beauty." },
  { name: "Eldoret", desc: "Highland city known for its elite athletes, cool climate, and growing economy." },
  { name: "Nakuru", desc: "Home to the flamingo-fringed Lake Nakuru National Park and a key Rift Valley stop." },
  { name: "Busia", desc: "Border town connecting Kenya to Uganda, a lively trade and travel gateway." },
  { name: "Bumala", desc: "A growing town in Busia County, known for its agricultural activity." },
  { name: "Kangemi", desc: "Neighbourhood on the edge of Nairobi, a key stop along the western corridor." },
  { name: "Luanda", desc: "A busy market town in Vihiga County, buzzing with local commerce and energy." },
  { name: "Maseno", desc: "University town straddling the equator, known for Maseno University." },
  { name: "Ugunja", desc: "A serene rural town in Siaya County, surrounded by rolling green hills." },
  { name: "Uthiru", desc: "A bustling suburb along Nairobi's western edge, popular with students and commuters." },
];

function Destinations() {
  return (
    <div className="page">
      <div className="page-content">
        <h1 className="page-title">Destinations</h1>
        <p className="dest-intro">
          We connect travellers to cities and towns across Kenya. Here are the destinations we serve.
        </p>
        <div className="dest-grid">
          {destinations.map((d) => (
            <div key={d.name} className="dest-card">
              <h3>{d.name}</h3>
              <p>{d.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Destinations;
