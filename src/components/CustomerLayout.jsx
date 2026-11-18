import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import StorageNotice from './StorageNotice';

export default function CustomerLayout() {
  return (
    <div className="site-shell">
      <Navbar />
      <StorageNotice />
      <main className="site-main">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
