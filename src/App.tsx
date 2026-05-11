import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Menu as MenuIcon, X, Plus, Minus, Trash2, Sun, Moon, Phone, CheckCircle2, ChevronRight, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem, CartItem, Category } from './types';
import { MENU_DATA } from './data/menu';

export default function App() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Online'>('Cash');
  
  // Queue Management State
  const [activeOrder, setActiveOrder] = useState<Order | null>(() => {
    const saved = localStorage.getItem('activeOrder');
    return saved ? JSON.parse(saved) : null;
  });
  const [lastTokenNumber, setLastTokenNumber] = useState(() => {
    const saved = localStorage.getItem('lastTokenNumber');
    return saved ? parseInt(saved) : 100;
  });
  const [nowServing, setNowServing] = useState(() => {
    const saved = localStorage.getItem('nowServing');
    return saved ? parseInt(saved) : 95;
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('activeOrder', JSON.stringify(activeOrder));
  }, [activeOrder]);

  useEffect(() => {
    localStorage.setItem('lastTokenNumber', lastTokenNumber.toString());
  }, [lastTokenNumber]);

  useEffect(() => {
    localStorage.setItem('nowServing', nowServing.toString());
  }, [nowServing]);

  // Simulate Queue Progress
  useEffect(() => {
    const interval = setInterval(() => {
      setNowServing(prev => {
        // Only progress if not caught up to last token
        if (prev < lastTokenNumber - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 45000); // Progress every 45 seconds

    return () => clearInterval(interval);
  }, [lastTokenNumber]);

  // Update Active Order Status based on Now Serving
  useEffect(() => {
    if (activeOrder && activeOrder.status !== 'Completed') {
      const orderToken = parseInt(activeOrder.token.replace('#Q', ''));
      const diff = orderToken - nowServing;
      
      let newStatus: OrderStatus = activeOrder.status;
      if (diff === 0) {
        newStatus = 'Ready';
      } else if (diff <= 2) {
        newStatus = 'Preparing';
      } else {
        newStatus = 'Received';
      }

      if (newStatus !== activeOrder.status) {
        setActiveOrder({ ...activeOrder, status: newStatus });
        if (newStatus === 'Ready') {
          // Play a sound
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
          gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.5);

          // Show notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('PU Goa E-Canteen', { body: 'Your order is ready for pickup!', icon: '/favicon.ico' });
          }
        }
      }
    }
  }, [nowServing, activeOrder]);

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const filteredMenu = MENU_DATA.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories: (Category | 'All')[] = ['All', 'Veg', 'Non-Veg', 'Beverages', 'Soft Drinks'];

  const placeOrder = () => {
    const newToken = `#Q${lastTokenNumber + 1}`;
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      token: newToken,
      items: [...cart],
      total: totalPrice + 5,
      status: 'Received',
      timestamp: Date.now(),
      estimatedMinutes: (lastTokenNumber + 1 - nowServing) * 3
    };

    setActiveOrder(newOrder);
    setLastTokenNumber(prev => prev + 1);
    setShowSuccessModal(true);
    setCart([]);
    setIsCartOpen(false);
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    setTimeout(() => setShowSuccessModal(false), 5000);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Sticky Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isDarkMode ? 'bg-slate-900/80' : 'bg-white/80'} backdrop-blur-xl border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <ShoppingCart className="text-white w-6 h-6" />
              </div>
              <span className="font-bold text-xl sm:text-2xl tracking-tighter bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                PU GOA E-CANTEEN
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {['Features', 'Menu', 'Reviews', 'Support'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium hover:text-orange-500 transition-colors">
                  {item}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
                aria-label="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-full hover:bg-orange-50 transition-colors group"
              >
                <ShoppingCart className={`w-6 h-6 group-hover:text-orange-500 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                    {totalItems}
                  </span>
                )}
              </button>

              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Main Menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed inset-0 z-40 md:hidden pt-20 px-4 ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}
          >
            <div className="flex flex-col gap-6 mt-8">
              {['Home', 'Menu', 'My Orders', 'Profile', 'Help'].map((item) => (
                <button 
                  key={item} 
                  className="text-2xl font-bold border-b border-slate-100 dark:border-slate-800 pb-4 text-left flex items-center justify-between group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                  <ChevronRight className="text-slate-300 group-hover:text-orange-500" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-20 sm:pt-24 pb-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 mb-16 sm:mb-24">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-sm font-semibold mb-6">
                <Clock className="w-4 h-4" />
                <span>Quick & Delicious Canteen Food</span>
              </div>
              <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                Satisfy Your <span className="text-orange-500">Cravings</span> Anytime.
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-lg leading-relaxed">
                Order your favorite campus meals from PU Goa E-Canteen. Freshly prepared, hygienically packed, and ready for pickup!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-xl shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all">
                  Order Now
                </button>
                <button className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                  View Menu
                </button>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative aspect-square lg:aspect-auto lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl"
            >
              <img 
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80" 
                alt="Delicious Food"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg">
                    <img src="https://i.pravatar.cc/100?u=1" alt="Student" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80 italic">"The fastest way to get lunch between lectures!"</p>
                    <p className="text-xs font-bold uppercase tracking-wider mt-1">- Aryan, CS Student</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Queue Dashboard */}
        <section className="px-4 max-w-7xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Now Serving Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-3xl border flex items-center justify-between overflow-hidden relative group ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl shadow-orange-500/5'}`}
            >
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-1">Now Serving</p>
                <h3 className="text-4xl font-black">#Q{nowServing}</h3>
              </div>
              <div className="bg-orange-500/10 p-4 rounded-2xl relative z-10 transition-transform group-hover:scale-110">
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 text-white/5 -mr-8 -mt-8 rounded-full" />
            </motion.div>

            {/* Active Order Status Card */}
            {activeOrder && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`col-span-1 md:col-span-2 p-6 rounded-3xl border overflow-hidden relative ${isDarkMode ? 'bg-orange-600 border-orange-500 text-white' : 'bg-orange-500 border-orange-600 text-white shadow-xl shadow-orange-500/20'}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest opacity-80">Your Active Order</p>
                      <h3 className="text-2xl font-black">{activeOrder.token}</h3>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl">
                      <p className="text-[10px] font-bold uppercase opacity-80">Status</p>
                      <p className="font-bold flex items-center gap-2">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        {activeOrder.status}
                      </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl">
                      <p className="text-[10px] font-bold uppercase opacity-80">Wait Time</p>
                      <p className="font-bold">~{activeOrder.status === 'Ready' ? '0' : Math.max(0, activeOrder.estimatedMinutes - (nowServing - (parseInt(activeOrder.token.replace('#Q','')) - (activeOrder.estimatedMinutes/3))))} mins</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl">
                      <p className="text-[10px] font-bold uppercase opacity-80">Ahead</p>
                      <p className="font-bold">{Math.max(0, parseInt(activeOrder.token.replace('#Q','')) - nowServing - 1)} Orders</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6 relative h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: activeOrder.status === 'Received' ? '25%' : activeOrder.status === 'Preparing' ? '60%' : activeOrder.status === 'Ready' ? '100%' : '0%' }}
                    className="absolute h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)]"
                  />
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-black uppercase tracking-tighter opacity-80 mb-4">
                  <span className={activeOrder.status === 'Received' ? 'text-white' : ''}>Received</span>
                  <span className={activeOrder.status === 'Preparing' ? 'text-white' : ''}>Preparing</span>
                  <span className={activeOrder.status === 'Ready' ? 'text-white' : ''}>Ready</span>
                </div>

                {activeOrder.status === 'Ready' && (
                  <motion.button 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setActiveOrder(null)}
                    className="w-full py-3 bg-white text-orange-500 rounded-xl font-bold text-sm shadow-xl hover:bg-orange-50 transition-colors"
                  >
                    I have picked up my order
                  </motion.button>
                )}
              </motion.div>
            )}
          </div>
        </section>

        {/* Menu Section */}
        <section id="menu" className="px-4 max-w-7xl mx-auto mb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Explore Our Menu</h2>
              <p className="text-slate-500 dark:text-slate-400">Fresh quality ingredients cooked with love.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search for dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} focus:ring-2 focus:ring-orange-500 outline-none`}
                />
              </div>
            </div>
          </div>

          {/* Categories Filter */}
          <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-10 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-full whitespace-nowrap text-sm font-bold transition-all border ${selectedCategory === cat 
                  ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20' 
                  : (isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300')
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Food Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredMenu.map((item) => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className={`group relative rounded-3xl overflow-hidden border transition-all hover:shadow-2xl ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'}`}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.category === 'Veg' ? 'bg-green-500 text-white' : item.category === 'Non-Veg' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
                        {item.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg truncate pr-2">{item.name}</h3>
                      <span className="font-black text-orange-500">₹{item.price}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-6 line-clamp-2 h-8 leading-relaxed">
                      {item.description}
                    </p>
                    <button 
                      onClick={() => addToCart(item)}
                      className="w-full py-3 bg-orange-500/10 text-orange-500 rounded-xl font-bold flex items-center justify-center gap-2 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm"
                    >
                      <Plus className="w-5 h-5" />
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {filteredMenu.length === 0 && (
            <div className="text-center py-24 opacity-60">
              <Search className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p className="text-xl font-medium">We couldn't find any items matching your search.</p>
              <button onClick={() => {setSearchQuery(''); setSelectedCategory('All')}} className="mt-4 text-orange-500 font-bold">Clear all filters</button>
            </div>
          )}
        </section>
      </main>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 right-0 h-full w-full sm:max-w-md z-[70] shadow-2xl flex flex-col ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}
            >
              <div className="p-6 flex items-center justify-between border-b dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-6 h-6 text-orange-500" />
                  <h2 className="text-xl font-bold">Your Order</h2>
                  <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full font-bold">{totalItems} Items</span>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                      <ShoppingCart className="w-10 h-10" />
                    </div>
                    <p className="text-lg font-medium">Your cart is empty.</p>
                    <p className="text-sm mt-2">Looks like you haven't added anything yet!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-sm sm:text-base">{item.name}</h4>
                              <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-orange-500 font-bold text-sm">₹{item.price}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-orange-100 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Select Payment Method</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setPaymentMethod('Cash')}
                        className={`py-3 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${paymentMethod === 'Cash' 
                          ? 'border-orange-500 bg-orange-500/5 text-orange-600' 
                          : 'border-transparent bg-white dark:bg-slate-800 text-slate-500'}`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'Cash' ? 'border-orange-500' : 'border-slate-300'}`}>
                          {paymentMethod === 'Cash' && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                        </div>
                        Cash
                      </button>
                      <button 
                        onClick={() => setPaymentMethod('Online')}
                        className={`py-3 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${paymentMethod === 'Online' 
                          ? 'border-orange-500 bg-orange-500/5 text-orange-600' 
                          : 'border-transparent bg-white dark:bg-slate-800 text-slate-500'}`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'Online' ? 'border-orange-500' : 'border-slate-300'}`}>
                          {paymentMethod === 'Online' && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                        </div>
                        Online
                      </button>
                    </div>
                    {paymentMethod === 'Cash' && (
                      <p className="text-[10px] text-slate-400 mt-2 ml-1 italic">* Please pay at the counter upon pickup.</p>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Subtotal</span>
                      <span>₹{totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Handling Fee</span>
                      <span>₹5</span>
                    </div>
                    <div className="flex justify-between text-lg font-black pt-3 border-t dark:border-slate-800">
                      <span>Total</span>
                      <span className="text-orange-500">₹{totalPrice + 5}</span>
                    </div>
                  </div>
                  <button 
                    onClick={placeOrder}
                    className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-500/30 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Place Order Now
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Cart Button (Mobile) */}
      {totalItems > 0 && !isCartOpen && (
        <motion.button 
          initial={{ scale: 0, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-8 right-8 z-40 bg-orange-500 text-white p-4 rounded-full shadow-2xl flex items-center gap-3 pr-6"
        >
          <div className="relative">
            <ShoppingCart className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 bg-white text-orange-500 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">View Cart</span>
            <span className="font-bold">₹{totalPrice}</span>
          </div>
        </motion.button>
      )}

      {/* Footer */}
      <footer id="support" className={`pt-24 pb-12 transition-colors ${isDarkMode ? 'bg-slate-900/50' : 'bg-white border-t'}`}>
        <div className="max-w-7xl mx-auto px-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-8 mb-16">
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <ShoppingCart className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tighter">PU GOA E-CANTEEN</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
              Experience the best college canteen service with our modern ordering system. Quality food at campus prices.
            </p>
            <div className="flex items-center gap-4">
              {['Twitter', 'Instagram', 'Github'].map(icon => (
                <button key={icon} className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-orange-500 hover:text-white transition-all">
                  <span className="sr-only">{icon}</span>
                  <div className="w-5 h-5 bg-current opacity-20 mask-icon" />
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-slate-400">Quick Links</h4>
            <ul className="space-y-4">
              {['Home', 'Today Specials', 'Veg Menu', 'Non-Veg', 'Support'].map(link => (
                <li key={link}><a href="#" className="text-slate-500 hover:text-orange-500 transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-slate-400">Contact Support</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-bold">Canteen Manager</p>
                  <a href="tel:8767697254" className="text-slate-500 hover:text-orange-500">8767697254</a>
                </div>
              </div>
              <p className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                Operating Hours:<br />8:00 AM - 9:00 PM (All Days)
              </p>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 pt-8 border-t dark:border-slate-800 text-center text-sm text-slate-500">
          <p>© 2026 PU GOA E-CANTEEN. Designed for PU Goa Campus Students.</p>
        </div>
      </footer>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`max-w-md w-full rounded-3xl overflow-hidden shadow-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}
            >
              <div className="bg-orange-500 p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-3xl -ml-16 -mb-16" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center shadow-2xl mb-6 relative z-10"
                >
                  <CheckCircle2 className="w-12 h-12 text-orange-500" />
                </motion.div>
                <h3 className="text-3xl font-black text-white relative z-10">Order Confirmed!</h3>
                {activeOrder && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-4 inline-block px-6 py-2 bg-black/20 backdrop-blur-md rounded-full text-white/90 text-sm font-bold border border-white/20"
                  >
                    Your Token: <span className="text-white font-black">{activeOrder.token}</span>
                  </motion.div>
                )}
              </div>
              <div className="p-8 text-center">
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto leading-relaxed">
                  Your order has been sent to the kitchen. {paymentMethod === 'Cash' ? 'Please keep the exact change ready for payment at the counter.' : 'Please show your online payment confirmation at the counter.'}
                </p>
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl mb-8 border dark:border-slate-700">
                  <div className="mb-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Payment Method</p>
                    <p className="font-bold text-orange-500">{paymentMethod} (Pay at Counter)</p>
                  </div>
                  <div className="pt-4 border-t dark:border-slate-700">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">More Support</p>
                    <p className="font-black text-lg">8767697254</p>
                    <p className="text-sm text-slate-500">Canteen Manager</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="px-8 py-3 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all"
                >
                  Return to Menu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
