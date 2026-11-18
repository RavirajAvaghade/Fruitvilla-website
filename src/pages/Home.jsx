import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Leaf, ShieldCheck, Clock, Sparkles, BadgePercent, MapPin, Wallet } from 'lucide-react';
import FruitImage from '../components/FruitImage';
import FruitGrid from '../components/FruitGrid';
import SectionHeader from '../components/SectionHeader';
import { EmptyState } from '../components/StateViews';
import { useStore } from '../context/StoreContext';
import { DELIVERY } from '../data/config';
import { discountPercent, formatINR } from '../services/helpers';

function Row({ products, emptyText }) {
  if (products.length === 0) return <EmptyState title="Nothing here yet" message={emptyText} />;
  return <FruitGrid products={products.slice(0, 5)} />;
}

export default function Home() {
  const { products } = useStore();
  const featured = products.filter((p) => p.featured);
  const seasonal = products.filter((p) => p.seasonal);
  const best = products.filter((p) => p.bestSeller);
  const offers = products.filter((p) => discountPercent(p) > 0 && p.available);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="hero-pill"><Sparkles size={14} /> Farm fresh &middot; Delivered daily</span>
            <h1>Fresh Fruits,<br /><span>Fresh Life.</span></h1>
            <p>
              Hand-picked seasonal fruits at honest daily prices, delivered to your door. Order in minutes and taste the
              difference.
            </p>
            <div className="hero-cta">
              <Link to="/fruits" className="btn btn-primary btn-lg">Shop Now <ArrowRight size={18} /></Link>
              <Link to="/about" className="btn btn-ghost btn-lg">Our story</Link>
            </div>
            <ul className="hero-points">
              <li><ShieldCheck size={16} /> 100% fresh</li>
              <li><Truck size={16} /> Free delivery above {formatINR(DELIVERY.freeAbove)}</li>
              <li><Clock size={16} /> Same-day slots</li>
            </ul>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="hero-blob" />
            <div className="hero-photo hp-main"><FruitImage imageKey="pomegranate" alt="Fresh pomegranates" eager /></div>
            <div className="hero-photo hp-a"><FruitImage imageKey="apple" alt="Fresh apples" eager /></div>
            <div className="hero-photo hp-b"><FruitImage imageKey="grapes" alt="Fresh grapes" eager /></div>
            <div className="hero-photo hp-c"><FruitImage imageKey="banana" alt="Fresh bananas" eager /></div>
            <div className="hero-chip chip-1"><Leaf size={16} /> Picked this morning</div>
            <div className="hero-chip chip-2"><Truck size={16} /> 60-min delivery*</div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="container trust-strip">
        <div><Truck size={22} /><span><strong>Home delivery</strong><small>Doorstep in hours</small></span></div>
        <div><Leaf size={22} /><span><strong>Farm fresh</strong><small>Sourced daily</small></span></div>
        <div><Wallet size={22} /><span><strong>Pay your way</strong><small>COD or online</small></span></div>
        <div><BadgePercent size={22} /><span><strong>Fair prices</strong><small>Updated every day</small></span></div>
      </section>

      <section className="container section">
        <SectionHeader eyebrow="Hand-picked" title="Featured Fruits" subtitle="Our freshest picks of the day" linkTo="/fruits" />
        <Row products={featured} emptyText="No featured fruits right now." />
      </section>

      <section className="section section-tint">
        <div className="container">
          <SectionHeader eyebrow="In season" title="Seasonal Fruits" subtitle="Best taste and best price, right now" linkTo="/fruits" />
          <Row products={seasonal} emptyText="No seasonal fruits right now." />
        </div>
      </section>

      <section className="container section">
        <SectionHeader eyebrow="Customer favourites" title="Best Selling Fruits" subtitle="What everyone is ordering" linkTo="/fruits" />
        <Row products={best} emptyText="No best sellers yet." />
      </section>

      <section className="section section-offer">
        <div className="container">
          <SectionHeader eyebrow="Limited time" title="Special Offers" subtitle="Save more on today's deals" linkTo="/fruits" />
          <Row products={offers} emptyText="No special offers today. Check back tomorrow!" />
        </div>
      </section>

      {/* WHY */}
      <section className="container section">
        <SectionHeader eyebrow="Why Fruivilla" title="Why choose Fruivilla?" subtitle="We care about what reaches your table" />
        <div className="why-grid">
          {[
            [Leaf, 'Always fresh', 'Fruits are sourced daily from trusted farms and markets - never stored for long.'],
            [BadgePercent, 'Honest daily prices', 'Prices follow the daily market rate so you never overpay.'],
            [ShieldCheck, 'Quality checked', 'Every fruit is checked and packed with care before it leaves us.'],
            [Truck, 'Fast home delivery', 'Convenient delivery to your door, with free delivery on bigger orders.'],
          ].map(([Icon, title, text]) => (
            <div className="why-card" key={title}>
              <div className="why-icon"><Icon size={24} /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DELIVERY INFO */}
      <section className="container section">
        <div className="delivery-banner">
          <div>
            <span className="eyebrow light">Delivery information</span>
            <h2>Fresh to your doorstep</h2>
            <p>We deliver between 7:00 AM and 9:00 PM every day. Enter your PIN code at checkout to confirm delivery in your area.</p>
          </div>
          <ul>
            <li><MapPin size={18} /> Delivery in selected PIN codes (checked at checkout)</li>
            <li><Truck size={18} /> {formatINR(DELIVERY.charge)} delivery charge, FREE above {formatINR(DELIVERY.freeAbove)}</li>
            <li><Wallet size={18} /> Cash on Delivery available</li>
          </ul>
          <Link to="/fruits" className="btn btn-orange btn-lg">Start shopping <ArrowRight size={18} /></Link>
        </div>
      </section>
    </>
  );
}
