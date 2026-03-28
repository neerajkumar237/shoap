/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag,
  ShoppingCart, 
  Plus, 
  Trash2, 
  User, 
  LogOut, 
  Package, 
  X, 
  Menu,
  Phone,
  MapPin,
  PlusCircle,
  Image as ImageIcon,
  DollarSign,
  Loader2,
  Instagram,
  MessageCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  CreditCard,
  Headphones
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  deleteDoc, 
  doc,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { db, auth } from './firebase';

// --- Types ---
interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  createdAt: any;
}

interface CartItem extends Product {
  quantity: number;
}

interface Order {
  id: string;
  items: CartItem[];
  total: number;
  customerName: string;
  customerPhone: string;
  address: string;
  status: 'pending' | 'completed';
  createdAt: any;
}

// --- Components ---

const TopBanner = () => (
  <motion.div 
    initial={{ y: -40 }}
    animate={{ y: 0 }}
    className="bg-orange-600 text-white py-2 px-4 text-center text-xs font-bold tracking-widest uppercase relative z-[60]"
  >
    Free shipping on all orders over ₹999 in Sumerpur! 🚚
  </motion.div>
);

const Navbar = ({ 
  cartCount, 
  onOpenCart, 
  user, 
  onLogout, 
  onOpenLogin,
  onOpenAdmin
}: { 
  cartCount: number; 
  onOpenCart: () => void; 
  user: FirebaseUser | null;
  onLogout: () => void;
  onOpenLogin: () => void;
  onOpenAdmin: () => void;
}) => (
  <motion.nav 
    initial={{ y: -100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800"
  >
    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="flex items-center gap-2 cursor-pointer"
      >
        <ShoppingBag className="w-6 h-6 text-orange-500" />
        <span className="font-bold text-xl tracking-tight text-zinc-100">THE BROTHER FASHION</span>
      </motion.div>
      
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-2">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenAdmin}
              className="flex items-center gap-1 text-sm font-medium text-zinc-400 hover:text-orange-500 transition-colors"
            >
              <Package className="w-4 h-4" />
              Admin
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1, color: '#ef4444' }}
              whileTap={{ scale: 0.9 }}
              onClick={onLogout}
              className="p-2 text-zinc-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        ) : (
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={onOpenLogin}
            className="p-2 text-zinc-400 hover:text-orange-500 transition-colors"
            title="Owner Login"
          >
            <User className="w-5 h-5" />
          </motion.button>
        )}
        
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onOpenCart}
          className="relative p-2 text-zinc-400 hover:text-orange-500 transition-colors"
        >
          <ShoppingCart className="w-6 h-6" />
          {cartCount > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full"
            >
              {cartCount}
            </motion.span>
          )}
        </motion.button>
      </div>
    </div>
  </motion.nav>
);

const Hero = ({ onShopNow }: { onShopNow: () => void }) => (
  <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative z-10 text-center px-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="inline-block px-4 py-1.5 mb-6 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-500 text-xs font-bold tracking-[0.2em] uppercase"
      >
        New Season Collection 2026
      </motion.div>
      <motion.h1 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-6xl md:text-8xl font-bold text-white mb-8 tracking-tighter"
      >
        THE BROTHER <br /> <span className="text-orange-500">FASHION</span>
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed"
      >
        Discover the latest trends in premium menswear. 
        Elevate your style with our curated collection of high-quality apparel.
      </motion.p>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="flex flex-wrap items-center justify-center gap-4 mb-16"
      >
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onShopNow}
          className="bg-orange-600 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-orange-900/20 hover:bg-orange-700 transition-all flex items-center gap-2 group"
        >
          Shop Now
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
        <motion.a 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="https://www.instagram.com/the_brothers_fashion09/"
          target="_blank"
          className="bg-zinc-900 text-white px-10 py-4 rounded-full font-bold text-lg border border-zinc-800 hover:bg-zinc-800 transition-all"
        >
          View Lookbook
        </motion.a>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="flex flex-col md:flex-row items-center justify-center gap-8 text-zinc-500 text-sm"
      >
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-orange-500" />
          <span>Prakash Sen</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-orange-500" />
          <span>7378204911</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-500" />
          <span>Sumerpur (Pali)</span>
        </div>
      </motion.div>
    </motion.div>
  </section>
);

const Features = () => {
  const features = [
    { icon: <ShieldCheck className="w-6 h-6" />, title: "Premium Quality", desc: "Handpicked fabrics and materials" },
    { icon: <Truck className="w-6 h-6" />, title: "Fast Shipping", desc: "Express delivery in Sumerpur" },
    { icon: <CreditCard className="w-6 h-6" />, title: "Secure Payment", desc: "100% safe transaction process" },
    { icon: <Headphones className="w-6 h-6" />, title: "24/7 Support", desc: "Dedicated customer service" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-20 border-y border-zinc-900">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {features.map((f, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
              {f.icon}
            </div>
            <div>
              <h4 className="font-bold text-zinc-100 mb-1">{f.title}</h4>
              <p className="text-zinc-500 text-sm">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const ProductCard = ({ product, onAddToCart, onQuickView, isAdmin, onDelete, index }: any) => {
  const badge = useMemo(() => {
    const badges = ['New', 'Hot', 'Trending', 'Limited'];
    return badges[index % badges.length];
  }, [index]);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -10 }}
      className="group bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 relative"
    >
      {/* Badge */}
      <div className="absolute top-4 right-4 z-20">
        <span className="bg-orange-600 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter shadow-lg">
          {badge}
        </span>
      </div>

      {isAdmin && (
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-4 left-4 z-20 bg-red-500/80 backdrop-blur-sm text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
          title="Delete Product"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      )}
      <div className="aspect-[4/5] overflow-hidden relative">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onQuickView(product)}
            className="bg-white text-zinc-900 p-3 rounded-full shadow-xl hover:bg-orange-500 hover:text-white transition-all"
            title="Quick View"
          >
            <ImageIcon className="w-5 h-5" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onAddToCart(product)}
            className="bg-orange-600 text-white p-3 rounded-full shadow-xl hover:bg-orange-700 transition-all"
            title="Add to Cart"
          >
            <ShoppingCart className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-zinc-100 group-hover:text-orange-500 transition-colors line-clamp-1">{product.name}</h3>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-orange-500 font-bold">₹{product.price.toLocaleString()}</p>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Sparkles key={i} className="w-2.5 h-2.5 text-orange-500/40 fill-orange-500/40" />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SectionDivider = () => (
  <div className="relative py-24 overflow-hidden">
    {/* Animated Background Elements */}
    <div className="absolute inset-0 flex items-center justify-center opacity-20">
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px]"
      />
    </div>

    <div className="max-w-7xl mx-auto px-4 relative">
      <div className="flex items-center justify-center gap-8">
        <motion.div 
          initial={{ width: 0, opacity: 0 }}
          whileInView={{ width: '100%', opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "circOut" }}
          className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-orange-500 flex-1"
        />
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: "spring" }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 border border-dashed border-orange-500/30 rounded-full"
            />
            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 shadow-2xl shadow-orange-500/10">
              <Sparkles className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-zinc-100 font-bold tracking-[0.3em] uppercase text-sm">New Arrivals</h3>
            <p className="text-zinc-500 text-xs mt-1">Discover our latest style drops</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ width: 0, opacity: 0 }}
          whileInView={{ width: '100%', opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "circOut" }}
          className="h-px bg-gradient-to-l from-transparent via-zinc-700 to-orange-500 flex-1"
        />
      </div>
    </div>
  </div>
);

const QuickViewModal = ({ product, onClose, onAddToCart }: any) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
    onClick={onClose}
  >
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      className="bg-zinc-950 border border-zinc-800 rounded-[2rem] max-w-4xl w-full overflow-hidden flex flex-col md:flex-row shadow-2xl"
      onClick={e => e.stopPropagation()}
    >
      <div className="md:w-1/2 aspect-[4/5] relative">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <button 
          onClick={onClose}
          className="absolute top-6 left-6 p-3 bg-black/50 backdrop-blur-md text-white rounded-full hover:bg-orange-600 transition-all md:hidden"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-orange-500 text-xs font-bold tracking-widest uppercase mb-2 block">Premium Collection</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{product.name}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-white transition-colors hidden md:block"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex items-center gap-4 mb-8">
          <p className="text-3xl font-bold text-orange-500">₹{product.price.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-zinc-500 text-sm">
            <Sparkles className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span>4.9 (120+ Reviews)</span>
          </div>
        </div>

        <p className="text-zinc-400 mb-8 leading-relaxed">
          Elevate your daily style with this premium piece from THE BROTHER FASHION. 
          Designed for comfort and crafted for the modern man who values quality.
        </p>

        <div className="space-y-6 mb-10">
          <div className="flex items-center gap-4 text-sm text-zinc-300">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-orange-500">
              <Package className="w-5 h-5" />
            </div>
            <span>In Stock & Ready to Ship</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-300">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-orange-500">
              <ArrowRight className="w-5 h-5" />
            </div>
            <span>Free Local Delivery in Sumerpur</span>
          </div>
        </div>

        <div className="mt-auto flex gap-4">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onAddToCart(product);
              onClose();
            }}
            className="flex-1 bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </motion.button>
          <motion.a 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href={`https://wa.me/917378204911?text=Hi, I'm interested in ${product.name}`}
            target="_blank"
            className="w-16 bg-zinc-900 text-white rounded-2xl flex items-center justify-center border border-zinc-800 hover:bg-zinc-800 transition-all"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.a>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const collectionRef = React.useRef<HTMLElement>(null);

  const scrollToCollection = () => {
    collectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Fetch products
  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const p = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(p);
    });
    return unsubscribe;
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);

  const handleLogout = async () => {
    await signOut(auth);
    setIsAdminOpen(false);
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete product.');
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 relative">
      <TopBanner />
      
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=2000")',
            backgroundAttachment: 'fixed'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80" />
      </div>
      
      <Navbar 
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} 
        onOpenCart={() => setIsCartOpen(true)}
        user={user}
        onLogout={handleLogout}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      <main className="pt-16 relative z-10">
        <Hero onShopNow={scrollToCollection} />
        
        <Features />

        <SectionDivider />

        <section ref={collectionRef} className="max-w-7xl mx-auto px-4 py-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <h2 className="text-4xl font-bold tracking-tight text-zinc-100">Our Collection</h2>
            <div className="h-px flex-1 bg-zinc-800 mx-8 hidden md:block" />
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart} 
                onQuickView={(p: Product) => setSelectedProduct(p)}
                isAdmin={user?.email === 'neerajsuthar680@gmail.com'}
                onDelete={() => handleDeleteProduct(product.id)}
                index={index}
              />
            ))}
            {products.length === 0 && (
              <div className="col-span-full py-20 text-center text-zinc-500">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No products available yet. Check back soon!</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-800 pt-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-16 mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-8 h-8 text-orange-500" />
              <span className="font-bold text-2xl tracking-tight text-zinc-100">THE BROTHER FASHION</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Elevate your style with THE BROTHER FASHION. We bring you the finest collection of premium menswear, 
              focusing on quality, comfort, and modern trends for the contemporary man.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-bold text-zinc-100">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-zinc-400 hover:text-orange-500 transition-colors flex items-center gap-2 group">
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" />
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => setIsCartOpen(true)} className="text-zinc-400 hover:text-orange-500 transition-colors flex items-center gap-2 group">
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" />
                  My Cart
                </button>
              </li>
              <li>
                <button onClick={() => setIsLoginOpen(true)} className="text-zinc-400 hover:text-orange-500 transition-colors flex items-center gap-2 group">
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all" />
                  Owner Login
                </button>
              </li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-bold text-zinc-100">Connect With Us</h3>
            <div className="flex gap-4">
              <motion.a 
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.9 }}
                href="https://www.instagram.com/the_brothers_fashion09/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-orange-600 hover:text-white transition-all shadow-lg"
              >
                <Instagram className="w-6 h-6" />
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.9 }}
                href="https://wa.me/917378204911" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-green-600 hover:text-white transition-all shadow-lg"
              >
                <MessageCircle className="w-6 h-6" />
              </motion.a>
            </div>
            <div className="space-y-3">
              <p className="text-zinc-400 flex items-center gap-3">
                <Phone className="w-4 h-4 text-orange-500" />
                7378204911
              </p>
              <p className="text-zinc-400 flex items-center gap-3">
                <User className="w-4 h-4 text-orange-500" />
                Prakash Sen
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-zinc-950 py-8 border-t border-zinc-800/50"
        >
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-zinc-400 text-sm">
              <MapPin className="w-5 h-5 text-orange-500" />
              <span className="font-medium">📍 Opposite :- Usha Puri Gate, Sumerpur (Pali)</span>
            </div>
            <p className="text-zinc-500 text-xs">© 2026 THE BROTHER FASHION. All rights reserved.</p>
          </div>
        </motion.div>
      </footer>

      {/* Floating WhatsApp Button */}
      <motion.a 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        href="https://wa.me/917378204911"
        target="_blank"
        className="fixed bottom-8 right-8 z-[100] bg-green-600 text-white p-4 rounded-full shadow-2xl shadow-green-900/20 flex items-center justify-center group"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-3 transition-all duration-500 whitespace-nowrap font-bold">
          Chat with us
        </span>
      </motion.a>

      {/* Modals */}
      <AnimatePresence>
        {isCartOpen && (
          <CartDrawer 
            cart={cart} 
            total={cartTotal}
            onClose={() => setIsCartOpen(false)} 
            onRemove={removeFromCart}
            onUpdateQty={updateQuantity}
            onClear={() => setCart([])}
          />
        )}
        {isLoginOpen && (
          <LoginModal 
            onClose={() => setIsLoginOpen(false)} 
            onSuccess={() => {
              setIsLoginOpen(false);
              setIsAdminOpen(true);
            }} 
          />
        )}
        {isAdminOpen && (
          <AdminPanel 
            onClose={() => setIsAdminOpen(false)} 
            onDeleteProduct={handleDeleteProduct}
          />
        )}
        {selectedProduct && (
          <QuickViewModal 
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={addToCart}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Modal Components ---

const CartDrawer = ({ 
  cart, 
  total,
  onClose, 
  onRemove, 
  onUpdateQty,
  onClear
}: { 
  cart: CartItem[]; 
  total: number;
  onClose: () => void; 
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onClear: () => void;
}) => {
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderData, setOrderData] = useState({ name: '', phone: '', address: '' });

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    try {
      await addDoc(collection(db, 'orders'), {
        items: cart,
        total,
        customerName: orderData.name,
        customerPhone: orderData.phone,
        address: orderData.address,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      alert('Order placed successfully! We will contact you soon.');
      onClear();
      onClose();
    } catch (error) {
      console.error('Order error:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex justify-end"
      onClick={onClose}
    >
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-md bg-zinc-950 h-full shadow-2xl flex flex-col border-l border-zinc-800"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-100">
            <ShoppingCart className="w-6 h-6 text-orange-500" />
            Your Cart
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-600">
              <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-4">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-20 h-24 object-cover rounded-lg border border-zinc-800"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-zinc-100">{item.name}</h4>
                  <p className="text-orange-500 font-bold mb-2">₹{item.price.toLocaleString()}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-zinc-800 rounded-lg">
                      <button 
                        onClick={() => onUpdateQty(item.id, -1)}
                        className="px-2 py-1 hover:bg-zinc-800 text-zinc-400"
                      >-</button>
                      <span className="w-8 text-center text-sm font-medium text-zinc-100">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQty(item.id, 1)}
                        className="px-2 py-1 hover:bg-zinc-800 text-zinc-400"
                      >+</button>
                    </div>
                    <button 
                      onClick={() => onRemove(item.id)}
                      className="text-zinc-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-zinc-800 bg-zinc-900">
            {!isOrdering ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-zinc-400">Total Amount</span>
                  <span className="text-2xl font-bold text-zinc-100">₹{total.toLocaleString()}</span>
                </div>
                <button 
                  onClick={() => setIsOrdering(true)}
                  className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-900/20"
                >
                  Proceed to Checkout
                </button>
              </>
            ) : (
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <h3 className="font-bold text-lg mb-2 text-zinc-100">Delivery Details</h3>
                <input 
                  required
                  type="text" 
                  placeholder="Full Name"
                  className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none"
                  value={orderData.name}
                  onChange={e => setOrderData({ ...orderData, name: e.target.value })}
                />
                <input 
                  required
                  type="tel" 
                  placeholder="Phone Number"
                  className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none"
                  value={orderData.phone}
                  onChange={e => setOrderData({ ...orderData, phone: e.target.value })}
                />
                <textarea 
                  required
                  placeholder="Delivery Address"
                  className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 focus:ring-2 focus:ring-orange-500 outline-none h-24"
                  value={orderData.address}
                  onChange={e => setOrderData({ ...orderData, address: e.target.value })}
                />
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsOrdering(false)}
                    className="flex-1 bg-zinc-800 text-zinc-100 border border-zinc-700 py-3 rounded-xl font-bold hover:bg-zinc-700 transition-all"
                  >
                    Back
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-all"
                  >
                    Place Order
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const LoginModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user.email === 'neerajsuthar680@gmail.com') {
        onSuccess();
      } else {
        await signOut(auth);
        setError('Unauthorized. Only the owner can access the dashboard.');
      }
    } catch (err: any) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-zinc-800"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-900/30 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-100">Owner Access</h2>
          <p className="text-zinc-400 text-sm">Secure login for THE BROTHER FASHION owner</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-zinc-800 border-2 border-zinc-700 text-zinc-100 py-4 rounded-xl font-bold hover:bg-zinc-700 transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                Sign in with Google
              </>
            )}
          </button>
          
          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
        </div>
        
        <button 
          onClick={onClose}
          className="w-full mt-6 text-zinc-500 text-sm hover:text-zinc-300"
        >
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
};

const AdminPanel = ({ onClose, onDeleteProduct }: { onClose: () => void; onDeleteProduct: (id: string) => void }) => {
  const [activeTab, setActiveTab] = useState<'add' | 'orders' | 'products'>('add');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', imageUrl: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const o = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(o);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const p = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(p);
    });
    return unsubscribe;
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'products'), {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        imageUrl: newProduct.imageUrl || 'https://picsum.photos/seed/fashion/800/1000',
        createdAt: serverTimestamp()
      });
      setNewProduct({ name: '', price: '', imageUrl: '' });
      alert('Product added successfully!');
    } catch (error) {
      console.error('Add product error:', error);
      alert('Failed to add product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: 'pending' | 'completed') => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus
      });
    } catch (error) {
      console.error('Update order status error:', error);
      alert('Failed to update order status.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-zinc-950 flex flex-col"
    >
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 h-16 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-zinc-100">Admin Dashboard</h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'add' ? 'bg-orange-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}
          >
            Add Product
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'products' ? 'bg-orange-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}
          >
            Manage Products
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'orders' ? 'bg-orange-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}
          >
            Orders ({orders.length})
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 bg-zinc-950">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'add' ? (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-zinc-900 p-8 rounded-3xl shadow-sm border border-zinc-800">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-zinc-100">
                  <PlusCircle className="w-5 h-5 text-orange-500" />
                  New Product Details
                </h3>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Product Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g. Premium Cotton Shirt"
                      value={newProduct.name}
                      onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Price (₹)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input 
                        required
                        type="number" 
                        className="w-full p-3 pl-10 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="999"
                        value={newProduct.price}
                        onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Product Image</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input 
                          type="url" 
                          className="w-full p-3 pl-10 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Image URL..."
                          value={newProduct.imageUrl}
                          onChange={e => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                        />
                      </div>
                      <label className="bg-zinc-800 p-3 rounded-xl cursor-pointer hover:bg-zinc-700 transition-colors">
                        <Plus className="w-5 h-5 text-zinc-400" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setNewProduct({ ...newProduct, imageUrl: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-1">Paste a URL or upload a small image (max 1MB)</p>
                  </div>
                  <button 
                    disabled={submitting}
                    className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publish Product'}
                  </button>
                </form>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-zinc-100">Live Preview</h3>
                <div className="bg-zinc-900 rounded-3xl p-4 border border-zinc-800 shadow-sm">
                  <div className="aspect-[4/5] bg-zinc-800 rounded-2xl mb-4 overflow-hidden">
                    {newProduct.imageUrl ? (
                      <img src={newProduct.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <ImageIcon className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <h4 className="font-bold text-zinc-100">{newProduct.name || 'Product Name'}</h4>
                  <p className="text-orange-500 font-bold">₹{newProduct.price || '0'}</p>
                </div>
              </div>
            </div>
          ) : activeTab === 'products' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-sm">
                  <div className="aspect-square overflow-hidden relative">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button 
                      onClick={() => onDeleteProduct(product.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-zinc-100 truncate">{product.name}</h4>
                    <p className="text-orange-500 font-bold">₹{product.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="col-span-full py-20 text-center text-zinc-600">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No products to manage</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {orders.length === 0 ? (
                <div className="py-20 text-center text-zinc-600">
                  <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>No orders yet</p>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="bg-zinc-900 p-6 rounded-3xl shadow-sm border border-zinc-800">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-lg text-zinc-100">{order.customerName}</h4>
                        <p className="text-sm text-zinc-500">{order.customerPhone}</p>
                      </div>
                      <span className="px-3 py-1 bg-orange-900/30 text-orange-500 rounded-full text-xs font-bold uppercase">
                        {order.status}
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm text-zinc-300">
                          <span>{item.name} x {item.quantity}</span>
                          <span className="font-medium text-zinc-100">₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="text-sm text-zinc-500">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {order.address}
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-lg font-bold text-zinc-100">Total: ₹{order.total.toLocaleString()}</div>
                        {order.status === 'pending' && (
                          <button 
                            onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                            className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition-all flex items-center gap-2"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
