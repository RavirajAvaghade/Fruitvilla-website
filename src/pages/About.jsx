import { Link } from 'react-router-dom';
import { Leaf, HeartHandshake, Truck, Sprout } from 'lucide-react';
import FruitImage from '../components/FruitImage';

export default function About() {
  return (
    <div className="container page">
      <section className="about-hero">
        <div>
          <span className="eyebrow">About Fruivilla</span>
          <h1>Fresh Fruits, Fresh Life.</h1>
          <p>
            Fruivilla is an online fruit store with home delivery. We bring seasonal, quality-checked fruits from trusted
            sources straight to your kitchen - at honest daily market prices.
          </p>
          <p>
            Our shop updates prices and availability every day, so what you see is what is actually fresh and ready to
            ship today.
          </p>
          <Link to="/fruits" className="btn btn-primary btn-lg">Explore fruits</Link>
        </div>
        <div className="about-photos" aria-hidden="true">
          <FruitImage imageKey="grapes" alt="Grapes" />
          <FruitImage imageKey="apple" alt="Apples" />
        </div>
      </section>

      <section className="why-grid">
        {[
          [Sprout, 'Sourced fresh', 'We buy daily from trusted growers and the wholesale market.'],
          [Leaf, 'Quality first', 'Each fruit is checked before packing - only the best goes out.'],
          [Truck, 'Delivered with care', 'Packed gently and delivered to your doorstep.'],
          [HeartHandshake, 'Customer happiness', 'Not happy with something? Tell us and we will make it right.'],
        ].map(([Icon, t, d]) => (
          <div className="why-card" key={t}>
            <div className="why-icon"><Icon size={24} /></div>
            <h3>{t}</h3>
            <p>{d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
