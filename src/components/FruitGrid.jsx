import FruitCard from './FruitCard';

export default function FruitGrid({ products }) {
  return (
    <div className="fruit-grid">
      {products.map((p) => (
        <FruitCard key={p.id} product={p} />
      ))}
    </div>
  );
}
