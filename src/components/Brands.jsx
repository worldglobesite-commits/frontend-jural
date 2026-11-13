export default function Brands({ brands, onSelect, selected }) {
  return (
    <div className="list-group">
      {brands.map((g) => (
        <button
          key={g.brand}
          type="button"
          className={`list-group-item list-group-item-action ${g.brand === selected ? 'active' : ''}`}
          onClick={() => onSelect(g.brand)}
        >
          <strong>{g.brand}</strong>
          {g.name && <span className="ms-2">{g.name}</span>}
        </button>
      ))}
    </div>
  );
}
