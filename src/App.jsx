import { Route, Routes } from 'react-router-dom';
import CustomerLayout from './components/CustomerLayout';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import AllFruits from './pages/AllFruits';
import FruitDetails from './pages/FruitDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import MyOrders from './pages/MyOrders';
import Login from './pages/Login';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import ProtectedRoute from './admin/ProtectedRoute';
import Dashboard from './admin/Dashboard';
import ManageFruits from './admin/ManageFruits';
import Orders from './admin/Orders';
import Customers from './admin/Customers';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Customer website */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/fruits" element={<AllFruits />} />
          <Route path="/fruits/:id" element={<FruitDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success/:id" element={<OrderSuccess />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* Admin panel (separate layout) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="fruits" element={<ManageFruits />} />
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<Customers />} />
          </Route>
        </Route>

        <Route path="*" element={<CustomerLayout />}>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
