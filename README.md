# Fruivilla - Fresh Fruits, Fresh Life.

A complete, frontend-only fruit e-commerce demo: customer storefront + admin panel.
Built with **React 18, Vite, React Router, Lucide icons, custom responsive CSS and localStorage**.

> **Demo only.** There is no backend and no payment gateway. See "Important limitations" below.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the production build
```

Requires Node 18+.

## Your fruit photographs

Put your four photos in **`src/assets/fruits/`** with these exact names:

| File          | Used for     |
| ------------- | ------------ |
| `apple.jpg`   | Apple        |
| `banana.jpg`  | Banana       |
| `grapes.jpg`  | Grapes       |
| `dalimb.jpg`  | Pomegranate  |

They are picked up automatically (no code change). Restart `npm run dev` after adding them.
`.jpeg`, `.png` and `.webp` with the same base name also work.

Until a file exists, the app falls back to a remote stock photograph, and if that also fails to
load, to a built-in Fruivilla placeholder, so no broken image icon is ever shown.
Mango, Orange, Watermelon and Pineapple use remote stock photographs (Unsplash links in
`src/data/images.js`). Those need internet access in the browser. For a production site, download
the photos you want and host them yourself, or upload your own from the admin panel.

## Routes

**Customer**: `/` Home, `/fruits` All Fruits (search, category, sort), `/fruits/:id` Details,
`/cart`, `/checkout`, `/order-success/:id`, `/my-orders`, `/login`, `/about`, `/contact`.

**Admin** (separate layout): `/admin/login`, `/admin` Dashboard, `/admin/fruits`, `/admin/orders`,
`/admin/customers`.

### Demo admin login

- Username: `admin`
- Password: `admin123`

These credentials are in the frontend source, visible to anyone, and **are not secure**. They must
never be used in production. Real admin authentication requires a backend.

## What is stored (localStorage keys)

| Key                              | Content                                   |
| -------------------------------- | ----------------------------------------- |
| `fruivilla:products:v1`          | Fruits, prices, units, images, availability |
| `fruivilla:cart:v1`              | Cart (product id + quantity)              |
| `fruivilla:orders:v1`            | Orders, order status, payment status      |
| `fruivilla:customer:v1`          | Demo customer profile + last address      |
| `fruivilla:admin-session:v1`     | Demo admin session                        |

All reads are wrapped in safe JSON parsing and every write handles quota/blocked-storage errors
(a red notice appears if saving fails). Data survives refreshes.

## How key behaviours work

- **Daily prices / availability**: edit the price directly in the Manage Fruits table (or in the edit
  form). The shop, cart and details pages update immediately; other open tabs of the same browser
  update too via the `storage` event.
- **Out of stock** fruits cannot be added to the cart; items that become unavailable while in the
  cart block checkout until removed. Availability is re-checked when the order is placed.
- **Price snapshots**: when an order is placed, each line stores the price at that moment. Later
  price changes never alter past orders.
- **Delivery**: Rs 40, free for subtotals of Rs 500 or more (`src/data/config.js`).
- **Quantity steps**: kg fruits in 0.5 kg steps, other units in whole numbers.
- **PIN code check**: mobile (10 digits starting 6-9) and PIN (6 digits) are validated. Delivery is
  only accepted for the demo PIN codes in `SERVICEABLE_PINCODES` in `src/data/config.js`
  (Pune 411xxx samples plus a few metro codes, e.g. `411038`). Edit that list freely.
- **Payments**: *Cash on Delivery* sets payment status "Pay on Delivery". *Online Payment* is a
  **demo interface only**: no card/UPI details are collected, no money moves, and the order is saved
  as payment status **Pending**. The admin can change it to Paid manually. Nothing is ever
  auto-marked as paid.
- **Order IDs**: format `FVYYMMDD-XXXXX`, checked for uniqueness against existing orders.
- **Customer "account"**: a demo profile (name + mobile, no password). My Orders also works without
  logging in by entering the mobile number used at checkout.

## Important limitations

1. **localStorage is per browser, per device.** A customer ordering on their phone and the admin
   on a laptop do **not** share data. Orders placed in one browser appear in the admin panel only
   when the admin panel is opened in that same browser. Real shared orders, prices and stock need a
   backend (for example Spring Boot) and a database.
2. **No real security.** Anyone can open DevTools and read or edit localStorage, including the admin
   session. Authentication, authorization and validation must be rebuilt on a server.
3. **No payment gateway.** Integrate Razorpay, Stripe, etc. on a backend before taking online
   payments.
4. Uploaded product images are resized and stored as data URLs; localStorage is limited to roughly
   5 MB, so prefer image URLs for many products.
5. The Contact form does not send messages anywhere (no backend).

## Project structure

```
fruivilla/
  public/                 favicon
  src/
    assets/fruits/        your local photos (apple/banana/grapes/dalimb.jpg)
    components/           Navbar, Footer, CartDrawer, FruitCard, FruitImage, ...
    pages/                Home, AllFruits, FruitDetails, Cart, Checkout, OrderSuccess, MyOrders, ...
    admin/                AdminLogin, AdminLayout, Dashboard, ManageFruits, Orders, Customers
    context/              StoreContext (products + orders), CartContext, AuthContext, ToastContext
    data/                 config.js, seedFruits.js, images.js
    services/             storage.js (safe localStorage), helpers.js
    hooks/                (reserved for custom hooks)
    App.jsx  main.jsx  style.css
  index.html  package.json  vite.config.js
```

## Next step: adding the backend

The data layer is isolated in `src/context/StoreContext.jsx` and `src/services/`. To connect a
Spring Boot API, replace the localStorage reads/writes in `StoreContext` (`addProduct`,
`updateProduct`, `placeOrder`, `updateOrder`, ...) with HTTP calls and replace the demo login in
`AuthContext` with real token-based authentication.
