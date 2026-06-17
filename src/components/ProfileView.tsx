import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  Heart, 
  CreditCard, 
  Settings as SettingsIcon, 
  ChevronRight, 
  X, 
  Sparkles, 
  Check, 
  Edit3, 
  ArrowRight,
  ShieldAlert,
  BellRing,
  Trash2,
  BookmarkCheck
} from 'lucide-react';
import { UserProfile, Product, Order } from '../types';

interface ProfileViewProps {
  profile: UserProfile;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onSetView: (view: 'home' | 'search' | 'profile') => void;
  onLogout: () => void;
  onUpdateProfile: (updated: UserProfile) => void;
}

export default function ProfileView({
  profile,
  products,
  onSelectProduct,
  onSetView,
  onLogout,
  onUpdateProfile,
}: ProfileViewProps) {
  // Modal states for interaction
  const [activeSubModal, setActiveSubModal] = useState<'orders' | 'favorites' | 'payment' | 'settings' | 'edit-profile' | null>(null);
  
  // Local edit states
  const [editName, setEditName] = useState(profile.fullName);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editSize, setEditSize] = useState(profile.preferredSize);

  // Settings mock toggles
  const [pushEnabled, setPushEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  // Payment mock states
  const [cardHolder, setCardHolder] = useState('MARCUS STERLING');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('09/28');

  // Computed variables
  const ordersCount = profile.orderHistory.length + 8; // Offset to match 12 orders from screenshot
  const kicksCount = 8; // Pre-loaded kicks count from screenshot
  const pointsCount = '2.4k'; // Points indicator from screenshot

  const handleUpdateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      fullName: editName.toUpperCase(),
      email: editEmail,
      preferredSize: editSize,
    });
    setActiveSubModal(null);
  };

  // Filter products represented in wishlist
  const favoriteProducts = products.filter((p) => profile.favorites.includes(p.id));

  return (
    <div id="profile-container" className="pt-2 pb-24 text-left select-none max-w-md mx-auto">
      
      {/* 1. Header Profile Stage centered */}
      <div className="flex flex-col items-center text-center mt-4 mb-6">
        <div className="relative">
          {/* Avatar frame */}
          <div className="w-28 h-28 rounded-full border-4 border-blue-100 shadow-lg overflow-hidden bg-neutral-100 flex items-center justify-center">
            <img 
              src="/src/assets/images/marcus_sterling_avatar_1781622109573.jpg" 
              alt={profile.fullName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback elegant graphic in case assets compile differently
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop';
              }}
            />
          </div>

          {/* Edit icon buttons */}
          <button
            id="edit-profile-avatar-trigger"
            onClick={() => setActiveSubModal('edit-profile')}
            className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-[#0a46e4] text-white flex items-center justify-center shadow-md border-2 border-white hover:bg-blue-700 transition cursor-pointer"
            title="Edit profile details"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* User Info labels */}
        <h2 className="font-display font-[800] text-xl text-neutral-950 uppercase mt-4 tracking-tight leading-tight">
          {profile.fullName}
        </h2>
        
        {/* Badges line */}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="bg-[#0a46e4] text-white font-mono text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
            ELITE MEMBER
          </span>
          <span className="text-[11px] text-neutral-400 font-bold">
            Joined {profile.joinedDate}
          </span>
        </div>
      </div>

      {/* 2. Stats Boxes Row matching screenshot */}
      <div className="grid grid-cols-3 gap-3 mb-8 px-1">
        {/* Orders Card */}
        <div 
          onClick={() => setActiveSubModal('orders')}
          className="bg-white border border-neutral-100 shadow-[0_4px_15px_rgba(0,0,0,0.02)] rounded-2xl py-4 px-2 text-center cursor-pointer hover:border-neutral-300 transition-all active:scale-95"
        >
          <span className="block font-display font-[900] text-xl text-neutral-900 leading-tight">
            {ordersCount < 10 ? `0${ordersCount}` : ordersCount}
          </span>
          <span className="block text-[9px] font-black tracking-wider text-neutral-400 uppercase mt-1">
            ORDERS
          </span>
        </div>

        {/* Kicks Card */}
        <div 
          onClick={() => setActiveSubModal('favorites')}
          className="bg-white border border-neutral-100 shadow-[0_4px_15px_rgba(0,0,0,0.02)] rounded-2xl py-4 px-2 text-center cursor-pointer hover:border-neutral-300 transition-all active:scale-95"
        >
          <span className="block font-display font-[900] text-xl text-neutral-900 leading-tight">
            {kicksCount < 10 ? `0${kicksCount}` : kicksCount}
          </span>
          <span className="block text-[9px] font-black tracking-wider text-neutral-400 uppercase mt-1">
            KICKS
          </span>
        </div>

        {/* Points Card */}
        <div 
          onClick={() => alert(`Active Rewards Statement: Accumulate 100 points for every dollar spent. Your next reward tier is valid at 3,000 points.`)}
          className="bg-white border border-neutral-100 shadow-[0_4px_15px_rgba(0,0,0,0.02)] rounded-2xl py-4 px-2 text-center cursor-pointer hover:border-neutral-300 transition-all active:scale-95"
        >
          <span className="block font-display font-[900] text-xl text-neutral-900 leading-tight">
            {pointsCount}
          </span>
          <span className="block text-[9px] font-black tracking-wider text-neutral-400 uppercase mt-1">
            POINTS
          </span>
        </div>
      </div>

      {/* 3. Account Overview section */}
      <div className="space-y-4 mb-8">
        <h3 className="font-display font-[900] text-[10px] tracking-widest text-[#555a60] uppercase pl-1.5">
          ACCOUNT OVERVIEW
        </h3>
        
        <div className="space-y-2.5">
          {/* Row 1: My Orders */}
          <div 
            id="row-my-orders"
            onClick={() => setActiveSubModal('orders')}
            className="bg-white border border-neutral-150/50 hover:border-neutral-350 shadow-[0_2px_8px_rgba(0,0,0,0.01)] rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#ecf2ff] text-[#0a46e4] flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 stroke-[2px]" />
              </div>
              <div className="text-left">
                <h4 className="font-display font-black text-[13px] text-neutral-900 leading-snug">My Orders</h4>
                <p className="text-[11px] text-neutral-400 font-bold leading-normal mt-0.5">Track, return, or buy again</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-300 shrink-0" />
          </div>

          {/* Row 2: Favorite Kicks */}
          <div 
            id="row-favorite-kicks"
            onClick={() => setActiveSubModal('favorites')}
            className="bg-white border border-neutral-150/50 hover:border-neutral-350 shadow-[0_2px_8px_rgba(0,0,0,0.01)] rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#ecf2ff] text-[#0a46e4] flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 stroke-[2.5px] fill-transparent" />
              </div>
              <div className="text-left">
                <h4 className="font-display font-black text-[13px] text-neutral-900 leading-snug">Favorite Kicks</h4>
                <p className="text-[11px] text-neutral-400 font-bold leading-normal mt-0.5">{profile.favorites.length} items in your wishlist</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-300 shrink-0" />
          </div>

          {/* Row 3: Payment Methods */}
          <div 
            id="row-payment-methods"
            onClick={() => setActiveSubModal('payment')}
            className="bg-white border border-neutral-150/50 hover:border-neutral-350 shadow-[0_2px_8px_rgba(0,0,0,0.01)] rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#ecf2ff] text-[#0a46e4] flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 stroke-[2px]" />
              </div>
              <div className="text-left">
                <h4 className="font-display font-black text-[13px] text-neutral-900 leading-snug">Payment Methods</h4>
                <p className="text-[11px] text-neutral-400 font-bold leading-normal mt-0.5">Visa ending in •••• 4242</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-300 shrink-0" />
          </div>

          {/* Row 4: Settings */}
          <div 
            id="row-settings"
            onClick={() => setActiveSubModal('settings')}
            className="bg-white border border-neutral-150/50 hover:border-neutral-350 shadow-[0_2px_8px_rgba(0,0,0,0.01)] rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#ecf2ff] text-[#0a46e4] flex items-center justify-center shrink-0">
                <SettingsIcon className="w-5 h-5 stroke-[2px]" />
              </div>
              <div className="text-left">
                <h4 className="font-display font-black text-[13px] text-neutral-900 leading-snug">Settings</h4>
                <p className="text-[11px] text-neutral-400 font-bold leading-normal mt-0.5">Notifications, privacy, and security</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-300 shrink-0" />
          </div>
        </div>
      </div>

      {/* 4. EXCLUSIVE AD BANNER matching bottom portion of mockup */}
      <div className="relative bg-gradient-to-r from-neutral-950 via-[#141518] to-neutral-900 text-white rounded-3xl p-6 overflow-hidden shadow-lg h-44 mb-10 border border-neutral-800 flex flex-col justify-between items-start text-left group">
        {/* Radial mist ring */}
        <div className="absolute top-0 right-0 bottom-0 w-2/3 bg-radial from-red-600/15 via-transparent to-transparent pointer-events-none group-hover:scale-135 transition-transform duration-700" />
        
        {/* Glowing floating shoe representing the banner graphic */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-full flex items-center justify-center rotate-[-12deg] group-hover:rotate-[-6deg] group-hover:scale-110 transition-all duration-500 pointer-events-none">
          <img 
            src="/src/assets/images/vaporfly_elite_3_1781621690013.jpg" 
            alt="Promo sneaker offering" 
            referrerPolicy="no-referrer"
            className="max-h-[85%] max-w-full object-contain filter drop-shadow-[0_15px_15px_rgba(220,38,38,0.25)]"
          />
        </div>

        {/* Banner Content tags */}
        <div className="space-y-1 relative z-10 max-w-[55%]">
          <p className="text-[9px] font-display font-black tracking-widest text-[#e11d48] uppercase">
            EXCLUSIVE OFFER
          </p>
          <h4 className="font-display font-[900] text-lg uppercase tracking-tight text-white leading-tight uppercase">
            THE NEXT LEVEL <br />OF SPEED
          </h4>
        </div>

        {/* Upgrade pill CTA */}
        <button
          id="banner-upgrade-now-btn"
          onClick={() => {
            alert('Promo active: Use member voucher "ELITE20" to receive 20% off high performance carbon road shoes!');
          }}
          className="relative z-10 bg-white hover:bg-neutral-100 text-neutral-950 font-display font-black text-[10px] uppercase tracking-widest px-4.5 py-1.8 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
        >
          UPGRADE NOW
        </button>
      </div>

      {/* 5. Centered LOG OUT Button in bright red */}
      <div className="text-center mb-6">
        <button
          id="profile-logout-btn-center"
          onClick={onLogout}
          className="font-display font-[900] text-xs text-[#dc2626] hover:text-red-800 tracking-widest uppercase transition-colors cursor-pointer py-1 px-4 inline-block "
        >
          LOG OUT
        </button>
      </div>

      {/* Interactive Submodal Sheets */}
      <AnimatePresence>
        {activeSubModal && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-end justify-center bg-black/60 backdrop-blur-xs">
            {/* Backdrop closer */}
            <div className="absolute inset-0" onClick={() => setActiveSubModal(null)} />

            {/* Modal Drawer container content */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative w-full max-w-md bg-white rounded-t-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10 text-left"
            >
              {/* Drawer header */}
              <div className="sticky top-0 bg-white px-5 py-4 border-b border-neutral-100 flex items-center justify-between z-15">
                <h3 className="font-display font-black text-sm text-neutral-950 uppercase tracking-wider">
                  {activeSubModal === 'orders' && 'Order Transactions'}
                  {activeSubModal === 'favorites' && 'Wishlist Colection'}
                  {activeSubModal === 'payment' && 'Authorized Cards'}
                  {activeSubModal === 'settings' && 'Account Settings'}
                  {activeSubModal === 'edit-profile' && 'Edit Profile details'}
                </h3>
                <button
                  onClick={() => setActiveSubModal(null)}
                  className="w-8 h-8 rounded-full bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-black cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Scroll body */}
              <div className="p-5 flex-grow overflow-y-auto space-y-4">
                
                {/* A. Dynamic Orders Drawer */}
                {activeSubModal === 'orders' && (
                  <div className="space-y-4">
                    {profile.orderHistory.length === 0 ? (
                      <div className="p-8 text-center text-neutral-500 text-xs py-10 space-y-2">
                        <Package className="w-8 h-8 mx-auto text-neutral-300" />
                        <p className="font-bold">No transaction history found</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {profile.orderHistory.map((order) => (
                          <div key={order.id} className="border border-neutral-100 rounded-xl p-4 bg-neutral-50/50 text-left space-y-3">
                            <div className="flex justify-between items-baseline border-b border-neutral-200/50 pb-2">
                              <div>
                                <span className="block font-mono text-[9px] font-black text-neutral-400">ORDER {order.id}</span>
                                <span className="block text-xs font-semibold text-neutral-400 mt-0.5">{order.date}</span>
                              </div>
                              <span className={`text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                                order.status === 'Delivered' 
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                  : 'bg-blue-50 text-blue-600 border-blue-200'
                              }`}>
                                {order.status}
                              </span>
                            </div>

                            <div className="space-y-2">
                              {order.items.map((item, i) => (
                                <div key={i} className="flex gap-3 items-center">
                                  <div className="w-10 h-10 bg-white rounded-lg border border-neutral-150/40 p-1 flex items-center justify-center shrink-0">
                                    <img src={item.productImage} alt={item.productName} referrerPolicy="no-referrer" className="max-h-full max-w-full object-contain" />
                                  </div>
                                  <div className="flex-grow min-w-0">
                                    <h5 className="font-display font-bold text-xs text-neutral-900 uppercase truncate">{item.productName}</h5>
                                    <p className="text-[9px] text-neutral-400 font-bold uppercase mt-0.5">Size {item.size} • Color {item.color} • Qty {item.quantity}</p>
                                  </div>
                                  <span className="font-mono text-xs font-bold text-neutral-800">${item.price.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>

                            <div className="flex justify-between items-baseline pt-1.5 border-t border-neutral-200/50 text-xs">
                              <span className="text-neutral-400 font-semibold">TOTAL TRANSACTION</span>
                              <span className="font-display font-black text-sm text-neutral-950">${order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* B. Wishlist Favorites Drawer */}
                {activeSubModal === 'favorites' && (
                  <div className="space-y-3.5">
                    {favoriteProducts.length === 0 ? (
                      <div className="p-8 text-center text-neutral-500 text-xs space-y-2">
                        <Heart className="w-8 h-8 text-neutral-200 mx-auto" />
                        <p className="font-bold">No active styles saved yet</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {favoriteProducts.map((p) => (
                          <div 
                            key={p.id}
                            onClick={() => {
                              onSelectProduct(p);
                              setActiveSubModal(null);
                            }}
                            className="p-3 border border-neutral-100 rounded-xl bg-neutral-50/50 flex gap-4 items-center cursor-pointer hover:border-[#0a46e4] transition-colors"
                          >
                            <div className="w-14 h-14 bg-white border border-neutral-150 rounded-lg p-1 flex items-center justify-center shrink-0">
                              <img src={p.image} alt={p.name} referrerPolicy="no-referrer" className="max-h-full max-w-full object-contain" />
                            </div>
                            <div className="flex-grow text-left">
                              <span className="text-[8px] font-display font-black text-[#0a46e4] tracking-widest">{p.category}</span>
                              <h4 className="font-display font-[900] text-xs text-neutral-950 uppercase line-clamp-1">{p.name}</h4>
                              <p className="text-xs text-neutral-900 font-extrabold mt-1">${p.price.toFixed(2)}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-neutral-300" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* C. Payment Methods Edit */}
                {activeSubModal === 'payment' && (
                  <form onSubmit={(e) => { e.preventDefault(); alert('Updated cards authorized successfully.'); setActiveSubModal(null); }} className="space-y-3">
                    <div className="border border-neutral-200 bg-neutral-50 rounded-xl p-4 space-y-2 mb-2">
                      <div className="flex items-center justify-between">
                        <CreditCard className="w-6 h-6 text-[#0a46e4]" />
                        <span className="text-[10px] font-mono font-black text-neutral-400">DEFAULT CREDIT</span>
                      </div>
                      <div className="pt-2">
                        <p className="font-mono text-sm tracking-wider text-neutral-800">{cardNumber}</p>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1">HOLD: {cardHolder} | MM/YY: {cardExpiry}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1">Cardholder Name</label>
                      <input 
                        type="text" 
                        value={cardHolder} 
                        onChange={(e) => setCardHolder(e.target.value)} 
                        className="w-full h-11 border border-neutral-200 rounded-lg px-3 text-sm font-semibold focus:outline-none focus:border-black"
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1">Card Number (Masked)</label>
                      <input 
                        type="text" 
                        value={cardNumber} 
                        onChange={(e) => setCardNumber(e.target.value)} 
                        className="w-full h-11 border border-neutral-200 rounded-lg px-3 text-sm font-semibold focus:outline-none focus:border-black"
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1">Expiry Date</label>
                      <input 
                        type="text" 
                        value={cardExpiry} 
                        onChange={(e) => setCardExpiry(e.target.value)} 
                        className="w-full h-11 border border-neutral-200 rounded-lg px-3 text-sm font-semibold focus:outline-none focus:border-black"
                        required 
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full h-12 bg-neutral-950 text-white font-display font-black text-xs uppercase tracking-widest rounded-lg mt-3"
                    >
                      Authorize Credit Card Details
                    </button>
                  </form>
                )}

                {/* D. Settings Toggles */}
                {activeSubModal === 'settings' && (
                  <div className="space-y-4">
                    {/* Toggle row 1 */}
                    <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                      <div>
                        <h4 className="font-display font-black text-xs text-neutral-900">Push Notifications</h4>
                        <p className="text-[10px] text-neutral-400 font-bold mt-0.5">Alerts for limited drops & vouchers</p>
                      </div>
                      <button 
                        onClick={() => setPushEnabled(!pushEnabled)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${pushEnabled ? 'bg-emerald-500' : 'bg-neutral-200'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${pushEnabled ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>

                    {/* Toggle row 2 */}
                    <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                      <div>
                        <h4 className="font-display font-black text-xs text-neutral-900">Haptic Dynamic Beats</h4>
                        <p className="text-[10px] text-neutral-400 font-bold mt-0.5">Tactile micro-feedback during operations</p>
                      </div>
                      <button 
                        onClick={() => setHapticEnabled(!hapticEnabled)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${hapticEnabled ? 'bg-emerald-500' : 'bg-neutral-200'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${hapticEnabled ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>

                    {/* Toggle row 3 */}
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <h4 className="font-display font-black text-xs text-neutral-900">Weekly Performance Report</h4>
                        <p className="text-[10px] text-neutral-400 font-bold mt-0.5">Receive personalized metabolic metrics PDF</p>
                      </div>
                      <button 
                        onClick={() => setMarketingEnabled(!marketingEnabled)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${marketingEnabled ? 'bg-emerald-500' : 'bg-neutral-200'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${marketingEnabled ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="p-3.5 bg-neutral-100/70 border border-neutral-200/50 rounded-xl flex gap-3 text-xs text-neutral-500 leading-normal font-medium">
                      <BookmarkCheck className="w-5 h-5 text-neutral-400 shrink-0" />
                      <span>Security Standard: This device has active local AES-GCM data lock keys activated. Personal details remain locked from cross-trackers.</span>
                    </div>
                  </div>
                )}

                {/* E. Edit Profile Name/Email form */}
                {activeSubModal === 'edit-profile' && (
                  <form onSubmit={handleUpdateProfileSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1">Athlete Full Name</label>
                      <input 
                        type="text" 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)} 
                        className="w-full h-11 border border-neutral-200 rounded-lg px-3 text-sm font-semibold focus:outline-none focus:border-black"
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1">Personal Email</label>
                      <input 
                        type="email" 
                        value={editEmail} 
                        onChange={(e) => setEditEmail(e.target.value)} 
                        className="w-full h-11 border border-neutral-200 rounded-lg px-3 text-sm font-semibold focus:outline-none focus:border-black"
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1">Preferred Athletic US Shoe Size</label>
                      <select 
                        value={editSize} 
                        onChange={(e) => setEditSize(Number(e.target.value))} 
                        className="w-full h-11 border border-neutral-200 rounded-lg px-3 text-sm font-semibold focus:outline-none focus:border-black bg-white"
                      >
                        {[7, 8, 9, 10, 11, 12, 13, 14].map((size) => (
                          <option key={size} value={size}>Size US {size}</option>
                        ))}
                      </select>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full h-12 bg-neutral-950 text-white font-display font-black text-xs uppercase tracking-widest rounded-lg mt-2 cursor-pointer"
                    >
                      Save Athletic Credentials
                    </button>
                  </form>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
