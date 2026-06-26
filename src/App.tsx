import { useState, useEffect, lazy, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  Bell,
  Home,
  Search as SearchIcon,
  ShoppingBag,
  User as UserIcon,
  ChevronRight,
  Heart,
  Star,
  LogOut,
  Sliders,
  Sparkles,
  ExternalLink,
  Smartphone
} from 'lucide-react';

import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';

import { products as localFallbackProducts } from './data';
import { Product, CartItem, UserProfile, Category, Order } from './types';

// Importing sub-components
import AuthScreen from './components/AuthScreen';
import ProductCard from './components/ProductCard';
import ProductDetails from './components/ProductDetails';
import CartDrawer from './components/CartDrawer';
const CheckoutPage = lazy(() => import('./components/CheckoutPage'));
const SearchView = lazy(() => import('./components/SearchView'));
import ProfileView from './components/ProfileView';
import NotificationToast, { ToastMessage, ToastType } from './components/NotificationToast';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Authentication state (Starts false to display Signup/Signin Screen #1)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [profile, setProfile] = useState<UserProfile>({
    email: 'marcus.sterling@elitekicks.com',
    fullName: 'MARCUS STERLING',
    isNewUser: false,
    joinedDate: 'Feb 2024',
    preferredSize: 10,
    favorites: ['vaporfly-elite-3', 'aerostratus-prime', 'velocity-nitro-3', 'aero-blast-v2'],
    orderHistory: [
      {
        id: 'EK-92841',
        date: 'Jun 05, 2026',
        total: 160.0,
        status: 'Delivered',
        items: [
          {
            productName: 'VELOCITY NITRO 3',
            productImage: '/src/assets/images/velocity_nitro_3_1781621309881.jpg',
            price: 160.00,
            quantity: 1,
            size: 10,
            color: 'Electric Blue'
          }
        ]
      },
      {
        id: 'EK-77124',
        date: 'May 18, 2026',
        total: 430.0,
        status: 'Delivered',
        items: [
          {
            productName: 'VAPORFLY ELITE 3',
            productImage: '/src/assets/images/vaporfly_elite_3_1781621690013.jpg',
            price: 250.00,
            quantity: 1,
            size: 10,
            color: 'Speed Red'
          },
          {
            productName: 'AEROSTRATUS PRIME',
            productImage: '/src/assets/images/aerostratus_prime_1781621707932.jpg',
            price: 180.00,
            quantity: 1,
            size: 10,
            color: 'Volt Green'
          }
        ]
      }
    ],
  });

  // Navigation and Drawer variables
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'profile'>('home');
  const [favoriteIds, setFavoriteIds] = useState<string[]>(['aero-blast-v2', 'volt-glide-runner']);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [promoAppliedInCheckout, setPromoAppliedInCheckout] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<Category>('ALL');
  const [products, setProducts] = useState<Product[]>(localFallbackProducts);

  // Flash toast notifications standardly
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Reactive Auth loading & database Synchronization on startup
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const uData = docSnap.data();
            
            // Sync orders collection asynchronously
            const ordersColRef = collection(db, 'users', user.uid, 'orders');
            const ordersSnap = await getDocs(ordersColRef);
            const oHistory: Order[] = [];
            ordersSnap.forEach((d) => {
              oHistory.push(d.data() as Order);
            });
            
            const favoritesList = uData.favorites || [];
            setProfile({
              email: user.email || '',
              fullName: uData.fullName || 'ATHLETE',
              isNewUser: false,
              joinedDate: uData.joinedDate || 'Jun 2026',
              preferredSize: uData.preferredSize || 10,
              favorites: favoritesList,
              orderHistory: oHistory
            });
            setFavoriteIds(favoritesList);
            setIsLoggedIn(true);
          }
        } catch (err) {
          console.error("Error loading account profile:", err);
        }
      } else {
        setIsLoggedIn(false);
      }
    });
    return unsubscribe;
  }, []);

  // Load products from Firestore, seed if empty
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const prodColRef = collection(db, 'products');
        const prodSnap = await getDocs(prodColRef);
        
        if (!prodSnap.empty) {
          const loadedProducts: Product[] = [];
          prodSnap.forEach((d) => {
            loadedProducts.push({ id: d.id, ...d.data() } as Product);
          });
          setProducts(loadedProducts);
        } else {
          // If empty and we are admin, seed it
          if (isLoggedIn && profile.email === 'athlete@elitekicks.com') {
            console.log("Database catalog is empty. Initializing seeding...");
            for (const prod of localFallbackProducts) {
              const docRef = doc(db, 'products', prod.id);
              await setDoc(docRef, prod);
            }
            console.log("Seeding complete!");
            // Reload
            const reSnap = await getDocs(prodColRef);
            const reLoaded: Product[] = [];
            reSnap.forEach((d) => {
              reLoaded.push({ id: d.id, ...d.data() } as Product);
            });
            setProducts(reLoaded);
            addToast("Database catalog seeded successfully!");
          }
        }
      } catch (err) {
        console.error("Error loading products from cloud database, using local fallback:", err);
      }
    };

    fetchProducts();
  }, [isLoggedIn, profile.email]);

  // Synchronize router location path with application state
  useEffect(() => {
    const path = location.pathname;
    if (path === '/search') {
      setActiveTab('search');
      setIsCheckoutOpen(false);
      setSelectedProduct(null);
    } else if (path === '/profile') {
      setActiveTab('profile');
      setIsCheckoutOpen(false);
      setSelectedProduct(null);
    } else if (path === '/checkout') {
      setIsCheckoutOpen(true);
      setSelectedProduct(null);
    } else if (path.startsWith('/product/')) {
      const productId = path.split('/product/')[1];
      const prod = products.find((p) => p.id === productId);
      if (prod) {
        setSelectedProduct(prod);
      } else {
        setSelectedProduct(null);
      }
      setIsCheckoutOpen(false);
    } else {
      setActiveTab('home');
      setIsCheckoutOpen(false);
      setSelectedProduct(null);
    }
  }, [location.pathname, products]);

  // Sync profile favoriteIds with client state and Firestore database
  useEffect(() => {
    setProfile((p) => ({ ...p, favorites: favoriteIds }));
    
    if (auth.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      updateDoc(userDocRef, { favorites: favoriteIds }).catch((err) => {
        console.error("Sync favorites to cloud error:", err);
      });
    }
  }, [favoriteIds]);

  // Auth Action Handlers
  const handleLoginSuccess = async (email: string, name: string, preferredSize: number, isNew: boolean) => {
    // Session is fully managed Reactively via subscription. Fallback update and toast:
    addToast(`Welcome to the club, ${name}!`);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setIsLoggedIn(false);
        setCartItems([]);
        setSidebarOpen(false);
        addToast('Logged out of elite kicks. Push harder tomorrow!', 'info');
      })
      .catch((err) => {
        console.error("Firebase custom logout error:", err);
      });
  };

  // Favoriting action
  const handleToggleFavorite = (id: string, e: any) => {
    e.stopPropagation(); // Avoid card click handler
    const targetProduct = products.find((p) => p.id === id);
    if (!targetProduct) return;

    if (favoriteIds.includes(id)) {
      setFavoriteIds((prev) => prev.filter((favId) => favId !== id));
      addToast(`Removed ${targetProduct.name} from favorite list`, 'info');
    } else {
      setFavoriteIds((prev) => [...prev, id]);
      addToast(`Saved ${targetProduct.name} to favorites`);
    }
  };

  // Cart Management
  const handleAddToCart = (product: Product, size: number, color: string) => {
    const existingIndex = cartItems.findIndex(
      (item) =>
        item.product.id === product.id &&
        item.selectedSize === size &&
        item.selectedColor === color
    );

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      setCartItems(updated);
    } else {
      setCartItems((prev) => [...prev, { product, selectedSize: size, selectedColor: color, quantity: 1 }]);
    }

    addToast(`Added ${product.name} (Size US ${size} - ${color}) to cart`);
    navigate(location.pathname.includes('/search') ? '/search' : (location.pathname.includes('/profile') ? '/profile' : '/'));
    setIsCartOpen(true); // Open the summary cart list
  };

  const handleUpdateCartQty = (idx: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(idx);
      return;
    }
    const updated = [...cartItems];
    updated[idx].quantity = newQty;
    setCartItems(updated);
  };

  const handleRemoveCartItem = (idx: number) => {
    const targetItem = cartItems[idx];
    setCartItems((prev) => prev.filter((_, i) => i !== idx));
    addToast(`Removed ${targetItem.product.name} from your cart`, 'info');
  };

  // Complete dynamic purchases
  const handleCheckoutCompletion = (promoUsed?: string) => {
    setPromoAppliedInCheckout(promoUsed === 'ELITE20');
    navigate('/checkout');
  };

  const handlePlaceOrderFromCheckout = (orderData: {
    address: {
      name: string;
      street: string;
      cityStateZip: string;
      phone: string;
    };
    payment: {
      last4: string;
      expiry: string;
    };
    total: number;
  }) => {
    const randomId = 'EK-' + Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    // Default checkout mockup products if active cart is empty
    const activeCheckoutItems = cartItems.length > 0 ? cartItems : [
      {
        product: products.find(p => p.id === 'vaporfly-elite-3') || products[0],
        selectedSize: 10.5,
        selectedColor: 'Speed Red',
        quantity: 1
      },
      {
        product: products.find(p => p.id === 'aerostratus-prime') || products[0],
        selectedSize: 10.5,
        selectedColor: 'Volt Green',
        quantity: 1
      }
    ];

    const newOrder: Order = {
      id: randomId,
      date: dateStr,
      total: orderData.total,
      status: 'Processing',
      items: activeCheckoutItems.map((item) => ({
        productName: item.product.name,
        productImage: item.product.image,
        price: item.product.price,
        quantity: item.quantity,
        size: item.selectedSize,
        color: item.selectedColor,
      })),
    };

    setProfile((prev) => ({
      ...prev,
      orderHistory: [newOrder, ...prev.orderHistory],
    }));

    if (auth.currentUser) {
      const orderDocRef = doc(db, 'users', auth.currentUser.uid, 'orders', randomId);
      setDoc(orderDocRef, newOrder).catch((err) => {
        console.error("Save order to Firestore subcollection error:", err);
      });
    }

    addToast(`Successfully placed order ${randomId}! Approved by Card Issuer.`, 'success');
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Retrieve products filtered by Category pill
  const filteredProducts = products.filter((p) => {
    if (activeCategory === 'ALL') return true;
    return p.category === activeCategory;
  });

  // Landing Drop shoe
  const aeroBlastShoe = products.find((p) => p.id === 'aero-blast-v2') || products[0];

  // Auth Screen display
  if (!isLoggedIn) {
    return (
      <div id="auth-screen-parent">
        <AuthScreen
          athleteSprinterImage="/src/assets/images/athlete_sprinter_1781620417490.jpg"
          onLoginSuccess={handleLoginSuccess}
        />
        <NotificationToast toasts={toasts} onDismiss={removeToast} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 max-w-sm sm:max-w-md mx-auto bg-neutral-950 text-white relative flex flex-col shadow-2xl border-x border-neutral-900 overflow-x-hidden">
      {/* Top Header Panel (Matches Screen #2) */}
      <header className="sticky top-0 bg-neutral-950/90 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-neutral-900 z-30">
        <button
          id="toggle-sidebar-nav-btn"
          onClick={() => setSidebarOpen(true)}
          className="w-10 h-10 rounded-full flex items-center justify-center border border-neutral-900 hover:bg-neutral-900 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5 text-neutral-300" />
        </button>

        <h1
          id="app-theme-title"
          onClick={() => {
            navigate('/');
            setActiveCategory('ALL');
          }}
          className="font-display font-[900] text-xl tracking-widest text-[#ffffff] cursor-pointer"
        >
          ELITE KICKS
        </h1>

        <button
          id="click-bell-notifications"
          onClick={() => addToast('No new notifications. You are perfectly tuned!', 'info')}
          className="w-10 h-10 rounded-full flex items-center justify-center border border-neutral-900 hover:bg-neutral-900 transition-colors relative cursor-pointer"
        >
          <Bell className="w-5 h-5 text-neutral-300" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-neutral-950" />
        </button>
      </header>

      {/* Main Tabs Segment */}
      <main className="flex-grow p-4 space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home-tab"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              {/* Dropping Banner (Matches Mockup 2 hero banner) */}
              <div
                id="hero-banner-card"
                className="relative bg-neutral-900 rounded-3xl p-5 overflow-hidden border border-neutral-800/80 shadow-lg group"
              >
                {/* Visual Glow */}
                <div className="absolute top-0 right-0 bottom-0 w-1/2 bg-radial from-red-600/10 via-transparent to-transparent pointer-events-none group-hover:scale-110 duration-500" />

                <div className="relative pr-24 space-y-4 max-w-[210px] text-left">
                  <span className="inline-block text-[10px] font-display font-black tracking-widest bg-blue-600 text-white px-2.5 py-1 rounded-sm uppercase">
                    New Drop
                  </span>

                  <div className="space-y-1">
                    <h2 className="font-display font-black text-2xl tracking-normal text-white leading-tight uppercase">
                      {aeroBlastShoe.name}
                    </h2>
                    <p className="text-neutral-400 text-xs leading-relaxed font-semibold">
                      Maximum propulsion for elite sprinters.
                    </p>
                  </div>

                  <motion.button
                    id="explore-newdrop-cta"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/product/' + aeroBlastShoe.id)}
                    className="bg-white hover:bg-neutral-100 text-black py-2.5 px-4 font-display text-xs font-[900] tracking-wider rounded-md uppercase cursor-pointer"
                  >
                    Explore Now
                  </motion.button>
                </div>

                {/* Abs Shoe graphic */}
                <img
                  src={aeroBlastShoe.image}
                  alt="Aero Blast V2 Drop"
                  referrerPolicy="no-referrer"
                  className="absolute right-[-20px] bottom-[-5px] top-6 w-[170px] object-contain rotate-[-12deg] filter drop-shadow-[0_15px_20px_rgba(0,0,0,0.5)] group-hover:scale-105 duration-350 transition-all pointer-events-none"
                />
              </div>

              {/* Horizontal Category pills */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest text-left">
                    Filter Category
                  </h3>
                  <span className="text-[10px] font-mono text-neutral-600">Slide to view</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                  {(['ALL', 'RUNNING', 'BASKETBALL', 'TRAINING', 'LIFESTYLE', 'CUSTOM', 'SLIDES'] as Category[]).map(
                    (cat) => (
                      <button
                        id={`category-pill-${cat}`}
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase shrink-0 tracking-wider border transition-all cursor-pointer ${
                          activeCategory === cat
                            ? 'bg-white border-white text-black font-extrabold shadow-md shadow-white/5'
                            : 'bg-neutral-900 border-neutral-850 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Trending section */}
              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-display font-black text-lg uppercase tracking-wider text-white">
                    Trending Now
                  </h3>
                  <button
                    id="view-all-products-btn"
                    onClick={() => {
                      navigate('/search');
                      setActiveCategory('ALL');
                    }}
                    className="text-xs text-blue-500 font-bold tracking-wide uppercase hover:underline"
                  >
                    View All
                  </button>
                </div>

                {/* Grid */}
                {filteredProducts.length === 0 ? (
                  <div className="p-12 text-center bg-neutral-900/40 rounded-3xl border border-neutral-850/60">
                    <p className="text-neutral-500 text-xs">No active models for this category currently.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isFavorite={favoriteIds.includes(product.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onClick={() => setSelectedProduct(product)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'search' && (
            <motion.div
              key="search-tab"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <span className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-neutral-500 text-xs mt-3">Loading explore footwear...</p>
                </div>
              }>
                <SearchView
                  products={products}
                  favorites={favoriteIds}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectProduct={(p) => navigate(p ? '/product/' + p.id : '/')}
                />
              </Suspense>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile-tab"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <ProfileView
                profile={profile}
                products={products}
                onSelectProduct={(p) => navigate(p ? '/product/' + p.id : '/')}
                onSetView={(v) => setActiveTab(v)}
                onLogout={handleLogout}
                onUpdateProfile={async (updated) => {
                  setProfile(updated);
                  if (auth.currentUser) {
                    const docRef = doc(db, 'users', auth.currentUser.uid);
                    await updateDoc(docRef, {
                      fullName: updated.fullName,
                      preferredSize: updated.preferredSize,
                      email: updated.email
                    }).then(() => {
                      addToast("Athletic profile successfully synchronized on Cloud");
                    }).catch((err) => {
                      console.error("Error updating profile in firestore:", err);
                      addToast("Cloud update failed, stored locally", "info");
                    });
                  } else {
                    addToast("Profile updated locally");
                  }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Bottom Navigation (Matches indicators from mockup 2) */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm sm:max-w-md bg-neutral-950/95 backdrop-blur-md border-t border-neutral-900 py-3 px-6 flex items-center justify-between z-30">
        {[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'search', label: 'Search', icon: SearchIcon },
          { id: 'cart', label: 'Cart', icon: ShoppingBag, hasBadge: true },
          { id: 'profile', label: 'Profile', icon: UserIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isTabActive = activeTab === tab.id || (tab.id === 'cart' && isCartOpen);

          return (
            <button
              id={`nav-tab-${tab.id}`}
              key={tab.id}
              onClick={() => {
                if (tab.id === 'cart') {
                  setIsCartOpen(true);
                } else {
                  navigate(tab.id === 'home' ? '/' : '/' + tab.id);
                }
              }}
              className="flex flex-col items-center justify-center p-2 relative h-12 w-12 transition-all cursor-pointer"
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-colors duration-200 ${
                    isTabActive ? 'text-blue-500' : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                />
                {tab.hasBadge && cartItems.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white font-mono text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2 ring-neutral-950 animate-bounce">
                    {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
                  </span>
                )}
              </div>

              {/* Indicator Dot beneath active (Screen #2) */}
              {isTabActive && (
                <motion.span
                  layoutId="active-nav-dot"
                  className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-blue-600"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Hamburger Sidebar Sliding Drawers */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex">
            {/* Overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Sidebar content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-72 max-w-xs bg-neutral-900 h-full border-r border-neutral-800 text-white flex flex-col p-6 z-10"
            >
              {/* Profile summary headers */}
              <div className="py-6 border-b border-neutral-800 text-left">
                <div className="w-14 h-14 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-display font-black text-xl mb-4">
                  {profile.fullName.charAt(0)}
                </div>
                <h4 className="font-display font-[900] uppercase text-base text-white leading-tight">
                  {profile.fullName}
                </h4>
                <p className="text-xs text-neutral-400 mt-1">{profile.email}</p>
                <div className="mt-3 inline-block bg-blue-550/20 text-blue-400 font-bold text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider bg-blue-950">
                  ⚡ Elite Level 1 Athlete
                </div>
              </div>

              {/* Links */}
              <div className="flex-grow py-6 space-y-4 text-left">
                <button
                  id="sidebar-home-link"
                  onClick={() => {
                    navigate('/');
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-between text-sm py-2 hover:text-blue-500 font-semibold transition-colors"
                >
                  <span>Home Dashboard</span>
                  <ChevronRight className="w-4 h-4 text-neutral-600" />
                </button>
                <button
                  id="sidebar-search-link"
                  onClick={() => {
                    navigate('/search');
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-between text-sm py-2 hover:text-blue-500 font-semibold transition-colors"
                >
                  <span>Explore Footwear</span>
                  <ChevronRight className="w-4 h-4 text-neutral-600" />
                </button>
                <button
                  id="sidebar-profile-link"
                  onClick={() => {
                    navigate('/profile');
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-between text-sm py-2 hover:text-blue-500 font-semibold transition-colors"
                >
                  <span>Athlete Insights</span>
                  <ChevronRight className="w-4 h-4 text-neutral-600" />
                </button>
                <button
                  id="sidebar-promo-rules-link"
                  onClick={() => {
                    alert('Member Code "ELITE20" discounts 20% off all shoe orders at checkout!');
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-between text-sm py-2 hover:text-blue-500 font-semibold transition-colors text-blue-400"
                >
                  <span>Vouchers & Promos</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>

              {/* Log out button */}
              <button
                id="sidebar-logout-btn"
                onClick={handleLogout}
                className="w-full h-12 bg-neutral-950 hover:bg-red-950 hover:text-red-300 border border-neutral-800 rounded-xl text-neutral-400 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer mb-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product details screen panel */}
      <ProductDetails
        product={selectedProduct}
        isOpen={selectedProduct !== null}
        onClose={() => navigate(location.pathname.includes('/search') ? '/search' : (location.pathname.includes('/profile') ? '/profile' : '/'))}
        isFavorite={selectedProduct ? favoriteIds.includes(selectedProduct.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onAddToCart={handleAddToCart}
      />

      {/* Cart lists Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleCheckoutCompletion}
      />

      {/* Dynamic Checkout Page matching user mockup */}
      <Suspense fallback={null}>
        <CheckoutPage
          isOpen={isCheckoutOpen}
          onClose={() => navigate(location.pathname.includes('/search') ? '/search' : (location.pathname.includes('/profile') ? '/profile' : '/'))}
          cartItems={cartItems}
          promoApplied={promoAppliedInCheckout}
          onPlaceOrder={handlePlaceOrderFromCheckout}
          clearCart={handleClearCart}
        />
      </Suspense>

      {/* Toast notifications */}
      <NotificationToast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
