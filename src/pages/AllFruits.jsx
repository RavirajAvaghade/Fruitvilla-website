import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import FruitGrid from '../components/FruitGrid';
import { EmptyState } from '../components/StateViews';
import { useStore } from '../context/StoreContext';

export default function AllFruits() {
  const { products } = useStore();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const category = params.get('category') || 'All';
  const sort = params.get('sort') || 'default';
  const onlyAvailable = params.get('available') === '1';

  function update(key, value) {
    const next = new URLSearchParams(params);
    if (!value || value === 'All' || value === 'default') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  }

  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map((p) => p.category))).sort()], [products]);

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = products.filter((p) => {
      if (category !== 'All' && p.category !== category) return false;
      if (onlyAvailable && !p.available) return false;
      if (term && !`${p.name} ${p.category} ${p.description}`.toLowerCase().includes(term)) return false;
      return true;
    });
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, q, category, sort, onlyAvailable]);

  const hasFilters = q || category !== 'All' || sort !== 'default' || onlyAvailable;

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>All Fruits</h1>
          <p>{visible.length} {visible.length === 1 ? 'fruit' : 'fruits'} {q && <>for &ldquo;{q}&rdquo;</>}</p>
        </div>
      </div>

      <div className="filter-bar">
        <label className="search-form filter-search">
          <Search size={18} />
          <input
            type="search"
            placeholder="Search by name or category"
            value={q}
            onChange={(e) => update('q', e.target.value)}
            aria-label="Search fruits"
          />
        </label>
        <label className="select-wrap">
          <SlidersHorizontal size={16} />
          <select value={sort} onChange={(e) => update('sort', e.target.value)} aria-label="Sort fruits">
            <option value="default">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </label>
        <label className="check-inline">
          <input type="checkbox" checked={onlyAvailable} onChange={(e) => update('available', e.target.checked ? '1' : '')} />
          In stock only
        </label>
      </div>

      <div className="chip-row" role="tablist" aria-label="Categories">
        {categories.map((c) => (
          <button
            type="button"
            key={c}
            role="tab"
            aria-selected={category === c}
            className={`chip ${category === c ? 'active' : ''}`}
            onClick={() => update('category', c)}
          >
            {c}
          </button>
        ))}
        {hasFilters && (
          <button type="button" className="chip chip-clear" onClick={() => setParams({}, { replace: true })}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <EmptyState title="No fruits in the store yet" message="The shop owner has not added any fruits." />
      ) : visible.length === 0 ? (
        <EmptyState
          title="No fruits found"
          message="Try a different search or clear your filters."
          actionLabel="Clear filters"
          onAction={() => setParams({}, { replace: true })}
        />
      ) : (
        <FruitGrid products={visible} />
      )}
    </div>
  );
}
