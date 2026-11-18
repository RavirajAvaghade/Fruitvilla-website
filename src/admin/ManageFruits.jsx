import { useMemo, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, Search, X, Upload, RotateCcw, Check } from 'lucide-react';
import FruitImage from '../components/FruitImage';
import { EmptyState } from '../components/StateViews';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { CATEGORIES, UNITS } from '../data/config';
import { formatINR } from '../services/helpers';

const BLANK = {
  name: '', category: CATEGORIES[0], price: '', mrp: '', unit: 'kg', image: '', imageKey: '', description: '',
  available: true, featured: false, seasonal: false, bestSeller: false,
};

// Resize an uploaded image to keep localStorage usage small (max 700px, JPEG).
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('Please choose an image file.'));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('This image could not be opened.'));
      img.onload = () => {
        const max = 700;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function QuickPrice({ product, onSave }) {
  const [val, setVal] = useState(String(product.price));
  const [lastPrice, setLastPrice] = useState(product.price);
  if (lastPrice !== product.price) {
    setLastPrice(product.price);
    setVal(String(product.price));
  }
  function commit() {
    const n = Number(val);
    if (!Number.isFinite(n) || n <= 0) {
      setVal(String(product.price));
      return;
    }
    if (n !== product.price) onSave(n);
  }
  return (
    <div className="quick-price">
      <span>₹</span>
      <input
        value={val}
        inputMode="decimal"
        aria-label={`Price of ${product.name}`}
        onChange={(e) => setVal(e.target.value.replace(/[^0-9.]/g, ''))}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
      />
      <small>/{product.unit}</small>
    </div>
  );
}

function FruitForm({ initial, onCancel, onSave }) {
  const [form, setForm] = useState(() => ({
    ...BLANK, ...initial, price: initial?.price ?? '', mrp: initial?.mrp ? initial.mrp : '',
  }));
  const [errors, setErrors] = useState({});
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef(null);
  const editing = !!initial?.id;

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }));
  }

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    try {
      set('image', await fileToDataUrl(file));
    } catch (err) {
      setUploadError(err.message);
    }
    e.target.value = '';
  }

  function submit(e) {
    e.preventDefault();
    const err = {};
    if (!form.name.trim()) err.name = 'Fruit name is required.';
    const price = Number(form.price);
    if (!Number.isFinite(price) || price <= 0) err.price = 'Enter a price greater than 0.';
    const mrp = form.mrp === '' ? 0 : Number(form.mrp);
    if (!Number.isFinite(mrp) || mrp < 0) err.mrp = 'Enter a valid original price.';
    if (form.image && !/^(https?:\/\/|data:image\/|\/)/i.test(form.image.trim())) {
      err.image = 'Image URL must start with http://, https:// or be an uploaded image.';
    }
    setErrors(err);
    if (Object.keys(err).length) return;
    onSave({ ...form, name: form.name.trim(), price, mrp, description: form.description.trim() });
  }

  const preview = { ...form, name: form.name || 'Preview' };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={editing ? 'Edit fruit' : 'Add fruit'}>
      <form className="modal" onSubmit={submit} noValidate>
        <div className="modal-head">
          <h3>{editing ? `Edit ${initial.name}` : 'Add new fruit'}</h3>
          <button type="button" className="icon-btn" onClick={onCancel} aria-label="Close"><X size={20} /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className={`field wide ${errors.name ? 'has-error' : ''}`}>
              <label htmlFor="m-name">Fruit name</label>
              <input id="m-name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Kiwi" autoFocus />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
            <div className="field">
              <label htmlFor="m-cat">Category</label>
              <input id="m-cat" list="cat-list" value={form.category} onChange={(e) => set('category', e.target.value)} />
              <datalist id="cat-list">{CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
            </div>
            <div className="field">
              <label htmlFor="m-unit">Unit</label>
              <select id="m-unit" value={form.unit} onChange={(e) => set('unit', e.target.value)}>
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div className={`field ${errors.price ? 'has-error' : ''}`}>
              <label htmlFor="m-price">Today&apos;s price (₹)</label>
              <input id="m-price" value={form.price} inputMode="decimal" onChange={(e) => set('price', e.target.value.replace(/[^0-9.]/g, ''))} />
              {errors.price && <span className="field-error">{errors.price}</span>}
            </div>
            <div className={`field ${errors.mrp ? 'has-error' : ''}`}>
              <label htmlFor="m-mrp">Original price (₹) <small>(optional, shows offer)</small></label>
              <input id="m-mrp" value={form.mrp} inputMode="decimal" onChange={(e) => set('mrp', e.target.value.replace(/[^0-9.]/g, ''))} />
              {errors.mrp && <span className="field-error">{errors.mrp}</span>}
            </div>
            <div className={`field wide ${errors.image ? 'has-error' : ''}`}>
              <label htmlFor="m-img">Product image URL</label>
              <input id="m-img" value={form.image.startsWith('data:') ? '(uploaded image)' : form.image} readOnly={form.image.startsWith('data:')}
                onChange={(e) => set('image', e.target.value)} placeholder="https://... (leave empty to use the default photo)" />
              {errors.image && <span className="field-error">{errors.image}</span>}
              <div className="img-tools">
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
                <button type="button" className="btn btn-outline btn-sm" onClick={() => fileRef.current?.click()}><Upload size={14} /> Upload image</button>
                {form.image && <button type="button" className="btn btn-ghost-danger btn-sm" onClick={() => set('image', '')}>Use default photo</button>}
              </div>
              {uploadError && <span className="field-error">{uploadError}</span>}
            </div>
            <div className="field wide">
              <label>Image preview</label>
              <div className="img-preview"><FruitImage product={preview} /></div>
            </div>
            <div className="field wide">
              <label htmlFor="m-desc">Description</label>
              <textarea id="m-desc" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
            </div>
            <div className="field wide">
              <label>Availability &amp; tags</label>
              <div className="toggle-row">
                <label className="check-inline"><input type="radio" name="avail" checked={form.available} onChange={() => set('available', true)} /> Available</label>
                <label className="check-inline"><input type="radio" name="avail" checked={!form.available} onChange={() => set('available', false)} /> Out of Stock</label>
              </div>
              <div className="toggle-row">
                <label className="check-inline"><input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} /> Featured</label>
                <label className="check-inline"><input type="checkbox" checked={form.seasonal} onChange={(e) => set('seasonal', e.target.checked)} /> Seasonal</label>
                <label className="check-inline"><input type="checkbox" checked={form.bestSeller} onChange={(e) => set('bestSeller', e.target.checked)} /> Best seller</label>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-primary"><Check size={16} /> {editing ? 'Save changes' : 'Add fruit'}</button>
        </div>
      </form>
    </div>
  );
}

export default function ManageFruits() {
  const { products, addProduct, updateProduct, deleteProduct, toggleAvailability, resetProducts } = useStore();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState(null); // null | { initial }
  const [confirm, setConfirm] = useState(null); // product to delete
  const [confirmReset, setConfirmReset] = useState(false);

  const list = useMemo(() => {
    const t = search.trim().toLowerCase();
    return t ? products.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(t)) : products;
  }, [products, search]);

  function save(data) {
    if (editor.initial?.id) {
      updateProduct(editor.initial.id, data);
      toast.success(`${data.name} updated`);
    } else {
      addProduct(data);
      toast.success(`${data.name} added`);
    }
    setEditor(null);
  }

  return (
    <div className="admin-page">
      <div className="admin-toolbar">
        <label className="search-form">
          <Search size={18} />
          <input type="search" placeholder="Search fruits..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search fruits" />
        </label>
        <div className="toolbar-actions">
          <button type="button" className="btn btn-outline" onClick={() => setConfirmReset(true)}><RotateCcw size={16} /> Reset samples</button>
          <button type="button" className="btn btn-primary" onClick={() => setEditor({ initial: null })}><Plus size={16} /> Add fruit</button>
        </div>
      </div>
      <p className="hint">Tip: edit the price directly in the table to update today&apos;s rate. Customers see changes immediately.</p>

      {products.length === 0 ? (
        <EmptyState title="No fruits yet" message="Add your first fruit or restore the sample fruits." actionLabel="Add fruit" onAction={() => setEditor({ initial: null })} />
      ) : list.length === 0 ? (
        <EmptyState title="No matching fruits" message="Try a different search." />
      ) : (
        <div className="table-card">
          <table className="data-table fruits-table">
            <thead>
              <tr><th>Fruit</th><th>Category</th><th>Daily price</th><th>Unit</th><th>Status</th><th className="right">Actions</th></tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id}>
                  <td data-label="Fruit">
                    <div className="cell-fruit">
                      <span className="thumb"><FruitImage product={p} /></span>
                      <strong>{p.name}</strong>
                    </div>
                  </td>
                  <td data-label="Category">{p.category}</td>
                  <td data-label="Daily price">
                    <QuickPrice product={p} onSave={(n) => { updateProduct(p.id, { price: n }); toast.success(`${p.name} price set to ${formatINR(n)}`); }} />
                  </td>
                  <td data-label="Unit">{p.unit}</td>
                  <td data-label="Status">
                    <button
                      type="button"
                      className={`switch ${p.available ? 'on' : ''}`}
                      onClick={() => { toggleAvailability(p.id); toast.info(`${p.name} marked ${p.available ? 'Out of Stock' : 'Available'}`); }}
                      aria-pressed={p.available}
                      aria-label={`${p.name} availability`}
                    >
                      <span className="switch-knob" />
                      <span className="switch-label">{p.available ? 'Available' : 'Out of Stock'}</span>
                    </button>
                  </td>
                  <td data-label="Actions" className="right">
                    <div className="row-actions">
                      <button type="button" className="icon-btn" onClick={() => setEditor({ initial: p })} aria-label={`Edit ${p.name}`}><Pencil size={17} /></button>
                      <button type="button" className="icon-btn danger" onClick={() => setConfirm(p)} aria-label={`Delete ${p.name}`}><Trash2 size={17} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editor && <FruitForm initial={editor.initial} onCancel={() => setEditor(null)} onSave={save} />}

      {confirm && (
        <div className="modal-backdrop" role="alertdialog" aria-modal="true">
          <div className="modal modal-sm">
            <div className="modal-body">
              <h3>Delete {confirm.name}?</h3>
              <p className="muted-line">This removes the fruit from the store. Past orders keep their saved details.</p>
            </div>
            <div className="modal-foot">
              <button type="button" className="btn btn-outline" onClick={() => setConfirm(null)}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={() => { deleteProduct(confirm.id); toast.success(`${confirm.name} deleted`); setConfirm(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {confirmReset && (
        <div className="modal-backdrop" role="alertdialog" aria-modal="true">
          <div className="modal modal-sm">
            <div className="modal-body">
              <h3>Reset to sample fruits?</h3>
              <p className="muted-line">This replaces all current fruits and prices with the 8 sample fruits. Orders are not affected.</p>
            </div>
            <div className="modal-foot">
              <button type="button" className="btn btn-outline" onClick={() => setConfirmReset(false)}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={() => { resetProducts(); toast.success('Sample fruits restored'); setConfirmReset(false); }}>Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
