import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import {
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
  FaYoutube
} from 'react-icons/fa';

import Logo from './Logo';
import { BRAND, DELIVERY } from '../data/config';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">

        {/* Brand */}
        <div className="footer-brand">
          <Logo light />

          <p>
            Farm-fresh fruits picked daily and delivered to your doorstep.
            Quality you can taste, freshness you can trust.
          </p>

          {/* Social Media */}
          <div className="footer-social">
            <h4>Follow Us</h4>

            <div className="social-icons">
              <a
                href="https://www.instagram.com/pavan_kale_5121/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>

              <a
                href="https://www.facebook.com/share/19J63BYw9Z/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <FaFacebookF />
              </a>

              <a
                href="https://wa.me/+91 9689008106"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <FaWhatsapp />
              </a>

              <a
                href="https://youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <FaYoutube />
              </a>
            </div>
          </div>
        </div>

        {/* Shop */}
        <div>
          <h4>Shop</h4>
          <ul>
            <li><Link to="/fruits">All Fruits</Link></li>
            <li><Link to="/fruits?category=Tropical">Tropical</Link></li>
            <li><Link to="/fruits?category=Citrus">Citrus</Link></li>
            <li><Link to="/cart">My Cart</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/my-orders">My Orders</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4>Get in touch</h4>
          <ul className="footer-contact">
            <li><Phone size={15} /> {BRAND.phone}</li>
            <li><Mail size={15} /> {BRAND.email}</li>
            <li><MapPin size={15} /> {BRAND.address}</li>
            <li><Clock size={15} /> Delivery 7:00 AM - 9:00 PM</li>
          </ul>
        </div>

      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>
            &copy; {new Date().getFullYear()} Fruivilla. All rights reserved.
          </span>

          <span>
            Free delivery above ₹{DELIVERY.freeAbove} &middot;
            Demo store - no real payments are processed.
          </span>
        </div>
      </div>
    </footer>
  );
}
