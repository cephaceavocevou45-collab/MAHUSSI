import { Link } from 'react-router-dom';
import { ChefHat, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-ink-800 text-cream-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terracotta-500 to-gold-500 flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-cream-100">MAHUSSI</span>
            </div>
            <p className="text-sm text-cream-300/80 leading-relaxed">
              Authentic African pastry and cuisine, crafted with love and delivered fresh to your door.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-9 h-9 rounded-lg bg-ink-700 hover:bg-terracotta-500 flex items-center justify-center transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-ink-700 hover:bg-terracotta-500 flex items-center justify-center transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-ink-700 hover:bg-terracotta-500 flex items-center justify-center transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-cream-100 mb-4 text-sm uppercase tracking-wide">Quick Links</h3>
            <ul className="space-y-2 text-sm text-cream-300/80">
              <li><Link to="/menu" className="hover:text-gold-400 transition-colors">Menu</Link></li>
              <li><Link to="/about" className="hover:text-gold-400 transition-colors">About Us</Link></li>
              <li><Link to="/orders" className="hover:text-gold-400 transition-colors">Track Order</Link></li>
              <li><Link to="/contact" className="hover:text-gold-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-cream-100 mb-4 text-sm uppercase tracking-wide">Categories</h3>
            <ul className="space-y-2 text-sm text-cream-300/80">
              <li><Link to="/menu?category=pastry" className="hover:text-gold-400 transition-colors">Pastry & Pâtisserie</Link></li>
              <li><Link to="/menu?category=main-dishes" className="hover:text-gold-400 transition-colors">Main Dishes</Link></li>
              <li><Link to="/menu?category=drinks" className="hover:text-gold-400 transition-colors">Drinks</Link></li>
              <li><Link to="/menu?category=desserts" className="hover:text-gold-400 transition-colors">Desserts</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-cream-100 mb-4 text-sm uppercase tracking-wide">Contact Us</h3>
            <ul className="space-y-3 text-sm text-cream-300/80">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold-400" />
                <span>123 Avenue de la Paix, Dakar, Senegal</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0 text-gold-400" />
                <span>+221 33 800 1234</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0 text-gold-400" />
                <span>contact@mahussi.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-ink-700 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cream-300/60">© 2026 MAHUSSI. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-cream-300/60">
            <Link to="/privacy" className="hover:text-gold-400">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gold-400">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
