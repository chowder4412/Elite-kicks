import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  HelpCircle, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  ArrowRight,
  X,
  Sparkles
} from 'lucide-react';
import { CartItem, Product } from '../types';

interface CheckoutPageProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  promoApplied: boolean;
  onPlaceOrder: (orderData: {
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
  }) => void;
  clearCart: () => void;
}

export default function CheckoutPage({
  isOpen,
  onClose,
  cartItems,
  promoApplied,
  onPlaceOrder,
  clearCart,
}: CheckoutPageProps) {
  // Address State (Alex Rivera)
  const [address, setAddress] = useState({
    name: 'Alex Rivera',
    street: '248 Elite Street, Suite 100',
    cityStateZip: 'Los Angeles, CA 90012',
    phone: '+1 (555) 012-3456',
  });
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editAddressForm, setEditAddressForm] = useState({ ...address });

  // Payment State
  const [payment, setPayment] = useState({
    cardNumber: '•••• •••• •••• 8842',
    last4: '8842',
    expiry: '12/26',
    holder: 'Alex Rivera',
    cvv: '123'
  });
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [editPaymentForm, setEditPaymentForm] = useState({
    cardNumber: '4111 2222 3333 8842',
    expiry: '12/26',
    holder: 'Alex Rivera',
    cvv: '123'
  });

  // Flow State
  const [isPlacing, setIsPlacing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successOrderNumber, setSuccessOrderNumber] = useState('');
  const [stripeSimulated, setStripeSimulated] = useState(false);

  if (!isOpen) return null;

  // Defaults fallback to match the screenshot if cart is empty
  const defaultMockProducts: CartItem[] = [
    {
      product: {
        id: 'vaporfly-elite-3',
        name: 'VAPORFLY ELITE 3',
        category: 'RUNNING',
        price: 250.00,
        rating: 4.9,
        reviewsCount: 218,
        image: '/src/assets/images/vaporfly_elite_3_1781621690013.jpg',
        description: '',
        specs: [],
        colors: []
      },
      selectedSize: 10.5,
      selectedColor: 'Speed Red',
      quantity: 1
    },
    {
      product: {
        id: 'aerostratus-prime',
        name: 'AEROSTRATUS PRIME',
        category: 'RUNNING',
        price: 180.00,
        rating: 4.8,
        reviewsCount: 88,
        image: '/src/assets/images/aerostratus_prime_1781621707932.jpg',
        description: '',
        specs: [],
        colors: []
      },
      selectedSize: 10.5,
      selectedColor: 'Volt Green',
      quantity: 1
    }
  ];

  // If there are real cart items, we checkout real items. If cart empty, we fallback to the exact matching mockup order items so they are fully previewable!
  const ActiveCheckoutItems = cartItems.length > 0 ? cartItems : defaultMockProducts;

  // Multipliers/Totals calculations
  const subtotal = ActiveCheckoutItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const discountAmount = promoApplied ? subtotal * 0.20 : 0;
  const taxableAmount = subtotal - discountAmount;
  const tax = taxableAmount * 0.08; // 8% sales tax matching Los Angeles
  const total = taxableAmount + tax;

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setAddress({
      name: editAddressForm.name,
      street: editAddressForm.street,
      cityStateZip: editAddressForm.cityStateZip,
      phone: editAddressForm.phone,
    });
    setIsEditingAddress(false);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = editPaymentForm.cardNumber.replace(/\s+/g, '');
    const last4 = cleanNum.slice(-4) || '8842';
    setPayment({
      cardNumber: `•••• •••• •••• ${last4}`,
      last4,
      expiry: editPaymentForm.expiry,
      holder: editPaymentForm.holder,
      cvv: editPaymentForm.cvv
    });
    setIsEditingPayment(false);
  };

  const handlePlaceOrderClick = async () => {
    setIsPlacing(true);
    setStripeSimulated(false);
    
    try {
      // 1. Call Backend API to create Stripe Payment Intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total })
      });
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setStripeSimulated(!!data.simulated);
      
      // 2. Confirm payment locally (simulate payment confirmation delay)
      setTimeout(() => {
        setIsPlacing(false);
        setIsSuccess(true);
        const generatedNum = `EK-${Math.floor(100000 + Math.random() * 900000)}`;
        setSuccessOrderNumber(generatedNum);
        
        // Execute global hooks
        onPlaceOrder({
          address,
          payment: {
            last4: payment.last4,
            expiry: payment.expiry
          },
          total
        });
        clearCart();
      }, 1500);
      
    } catch (err: any) {
      console.error("Payment flow error:", err);
      alert("Payment processing failed: " + (err.message || "Please check your network."));
      setIsPlacing(false);
    }
  };

  const handleCloseAndGoHome = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-black/60 backdrop-blur-xs">
      <div id="checkout-root-container" className="relative w-full max-w-md h-full sm:h-[92vh] bg-[#f8fbfe] text-neutral-900 rounded-none sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Custom Header matching the screenshot */}
        <div className="sticky top-0 bg-white px-5 py-4 flex items-center justify-between border-b border-neutral-100 z-10 shadow-xs">
          <button
            id="checkout-back-btn"
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-700 transition"
            title="Back for more"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="font-display font-[900] text-sm uppercase tracking-widest text-[#0a0a0a]">
            ELITE KICKS
          </h1>

          <button
            id="checkout-help-btn"
            onClick={() => alert('Need assistance? Our Elite Live Support operates 24/7. Connect at support@elitekicks.fit')}
            className="w-10 h-10 rounded-full hover:bg-neutral-100 flex items-center justify-center text-[#1c1e21] transition"
            title="Help Support"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Layout Body */}
        <div className="flex-grow overflow-y-auto px-5 py-5 space-y-6 pb-24 text-left">
          
          {/* Shipping Address Block matching screenshot */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-neutral-100/70">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-black text-[11px] tracking-widest text-neutral-400 uppercase">
                SHIPPING ADDRESS
              </h3>
              <button
                id="change-address-link"
                onClick={() => {
                  setEditAddressForm({ ...address });
                  setIsEditingAddress(true);
                }}
                className="text-xs font-bold text-[#0a46e4] hover:underline"
              >
                Change
              </button>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-neutral-100/60 flex items-center justify-center text-neutral-500 mt-0.5">
                <MapPin className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="text-sm space-y-1">
                <p className="font-black text-neutral-900">{address.name}</p>
                <div className="text-neutral-500 font-medium leading-relaxed">
                  <p>{address.street}</p>
                  <p>{address.cityStateZip}</p>
                </div>
                <p className="text-neutral-400/90 text-xs font-semibold pt-1">{address.phone}</p>
              </div>
            </div>
          </div>

          {/* Payment Method block matching screenshot */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-neutral-100/70">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-black text-[11px] tracking-widest text-neutral-400 uppercase">
                PAYMENT METHOD
              </h3>
              <button
                id="edit-payment-link"
                onClick={() => {
                  setEditPaymentForm({
                    cardNumber: payment.cardNumber.includes('••') ? '4111 2222 3333 8842' : payment.cardNumber,
                    expiry: payment.expiry,
                    holder: payment.holder,
                    cvv: payment.cvv
                  });
                  setIsEditingPayment(true);
                }}
                className="text-xs font-bold text-[#0a46e4] hover:underline"
              >
                Edit
              </button>
            </div>

            {/* Inner box matching screenshot */}
            <div className="border border-neutral-200/60 rounded-xl p-4 flex items-center justify-between bg-neutral-50/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 bg-blue-600 rounded flex items-center justify-center text-white font-mono font-bold text-[10px] shadow-sm shrink-0">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-extrabold text-sm tracking-wider text-neutral-900">{payment.cardNumber}</p>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">EXPIRES {payment.expiry}</p>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-neutral-300" />
            </div>
          </div>

          {/* Your Order Row matching screenshot */}
          <div className="space-y-3">
            <h3 className="font-display font-black text-[11px] tracking-widest text-neutral-400 uppercase pl-1">
              YOUR ORDER ({ActiveCheckoutItems.reduce((acc, i) => acc + i.quantity, 0)} ITEMS)
            </h3>

            <div className="space-y-2.5">
              {ActiveCheckoutItems.map((item, index) => (
                <div 
                  key={`${item.product.id}-${index}`}
                  className="bg-white rounded-xl p-3 shadow-[0_1px_5px_rgba(0,0,0,0.01)] border border-neutral-100 flex gap-4 items-center"
                >
                  <div className="w-16 h-16 rounded-xl bg-neutral-50 flex items-center justify-center p-1 border border-neutral-100/50 overflow-hidden shrink-0">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      referrerPolicy="no-referrer"
                      className="max-h-[90%] max-w-[95%] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.05)]"
                    />
                  </div>
                  <div className="flex-grow min-w-0 pr-1 text-left">
                    <h4 className="font-display font-black text-xs text-neutral-900 uppercase truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-[10px] text-neutral-400 font-bold mt-0.5">
                      Size: {item.selectedSize} | Color: {item.selectedColor}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] font-black text-neutral-400 uppercase">
                        Qty: {item.quantity}
                      </span>
                      <span className="font-display font-[800] text-xs text-[#0a46e4]">
                        ${item.product.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary box matching screenshot */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-neutral-100/70 space-y-4">
            <h3 className="font-display font-black text-[11px] tracking-widest text-neutral-400 uppercase">
              ORDER SUMMARY
            </h3>

            <div className="space-y-2 text-xs font-semibold text-neutral-500">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="text-neutral-800 font-mono font-bold">${subtotal.toFixed(2)}</span>
              </div>
              
              {promoApplied && (
                <div className="flex justify-between items-center text-emerald-600 font-bold">
                  <span>Elite Promo Discount (-20%)</span>
                  <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span>Shipping</span>
                <span className="text-[#0a46e4] font-display font-black">FREE</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Tax</span>
                <span className="text-neutral-800 font-mono font-bold">${tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-neutral-100 pt-4 flex justify-between items-baseline">
              <span className="font-display font-[900] text-sm text-neutral-900 tracking-tight">TOTAL</span>
              <span className="font-display font-[900] text-2xl text-neutral-950 tracking-tight">
                ${total.toFixed(2)}
              </span>
            </div>

            {/* Place Order Button */}
            <div className="pt-2">
              <motion.button
                id="place-order-cta-btn"
                whileTap={{ scale: 0.98 }}
                onClick={handlePlaceOrderClick}
                disabled={isPlacing}
                className="w-full h-13 bg-neutral-950 hover:bg-neutral-900 text-white font-display font-black text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-3 transition cursor-pointer disabled:opacity-50"
              >
                {isPlacing ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>PLACE ORDER</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5px]" />
                  </>
                )}
              </motion.button>
            </div>

            {/* Terms Disclaimer */}
            <p className="text-[10px] text-neutral-400/90 leading-relaxed text-center font-medium max-w-xs mx-auto">
              By placing your order, you agree to Elite Kicks' {' '}
              <a href="#tos" onClick={(e) => e.preventDefault()} className="underline hover:text-black">Terms of Service</a>
              {' '} and {' '}
              <a href="#privacy" onClick={(e) => e.preventDefault()} className="underline hover:text-black">Privacy Policy</a>.
            </p>
          </div>

          {/* Lower Trust badges matching screenshot footer */}
          <div className="grid grid-cols-3 gap-2 border-t border-neutral-100 pt-5 pb-2 text-center">
            <div className="space-y-1.5 flex flex-col items-center">
              <ShieldCheck className="w-5 h-5 text-neutral-400 shrink-0" />
              <span className="text-[8px] font-black tracking-wider uppercase text-neutral-500 leading-none">SECURE PAYMENT</span>
            </div>
            <div className="space-y-1.5 flex flex-col items-center">
              <Truck className="w-5 h-5 text-neutral-400 shrink-0" />
              <span className="text-[8px] font-black tracking-wider uppercase text-neutral-500 leading-none">FAST DELIVERY</span>
            </div>
            <div className="space-y-1.5 flex flex-col items-center">
              <RotateCcw className="w-5 h-5 text-neutral-400 shrink-0" />
              <span className="text-[8px] font-black tracking-wider uppercase text-neutral-500 leading-none">30-DAY RETURNS</span>
            </div>
          </div>

        </div>

        {/* Change Address Modal Dialog */}
        <AnimatePresence>
          {isEditingAddress && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-30 flex items-end justify-center">
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="bg-white w-full rounded-t-[2rem] p-6 text-left space-y-4 shadow-2xl z-40"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black text-sm text-neutral-900 tracking-tight uppercase">
                    Update Shipping Address
                  </h3>
                  <button
                    onClick={() => setIsEditingAddress(false)}
                    className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveAddress} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1">Full Name</label>
                    <input
                      type="text"
                      className="w-full h-11 border border-neutral-200 rounded-lg px-3 text-sm font-semibold focus:outline-none focus:border-black"
                      value={editAddressForm.name}
                      onChange={(e) => setEditAddressForm({ ...editAddressForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1">Street Address</label>
                    <input
                      type="text"
                      className="w-full h-11 border border-neutral-200 rounded-lg px-3 text-sm font-semibold focus:outline-none focus:border-black"
                      value={editAddressForm.street}
                      onChange={(e) => setEditAddressForm({ ...editAddressForm, street: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1">City, State, & ZIP Code</label>
                    <input
                      type="text"
                      className="w-full h-11 border border-neutral-200 rounded-lg px-3 text-sm font-semibold focus:outline-none focus:border-black"
                      value={editAddressForm.cityStateZip}
                      onChange={(e) => setEditAddressForm({ ...editAddressForm, cityStateZip: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1">Phone Number</label>
                    <input
                      type="text"
                      className="w-full h-11 border border-neutral-200 rounded-lg px-3 text-sm font-semibold focus:outline-none focus:border-black"
                      value={editAddressForm.phone}
                      onChange={(e) => setEditAddressForm({ ...editAddressForm, phone: e.target.value })}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-12 bg-neutral-950 text-white font-display font-black text-xs uppercase tracking-widest rounded-lg transition mt-2"
                  >
                    Save & Apply Address
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Edit Payment Modal Dialog */}
        <AnimatePresence>
          {isEditingPayment && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-30 flex items-end justify-center">
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="bg-white w-full rounded-t-[2rem] p-6 text-left space-y-4 shadow-2xl z-40"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black text-sm text-neutral-900 tracking-tight uppercase">
                    Update Payment Card
                  </h3>
                  <button
                    onClick={() => setIsEditingPayment(false)}
                    className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSavePayment} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      className="w-full h-11 border border-neutral-200 rounded-lg px-3 text-sm font-semibold focus:outline-none focus:border-black"
                      value={editPaymentForm.holder}
                      onChange={(e) => setEditPaymentForm({ ...editPaymentForm, holder: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1">Card Number</label>
                    <input
                      type="text"
                      maxLength={19}
                      placeholder="4111 2222 3333 8842"
                      className="w-full h-11 border border-neutral-200 rounded-lg px-3 text-sm font-semibold focus:outline-none focus:border-black"
                      value={editPaymentForm.cardNumber}
                      onChange={(e) => setEditPaymentForm({ ...editPaymentForm, cardNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        maxLength={5}
                        placeholder="12/26"
                        className="w-full h-11 border border-neutral-200 rounded-lg px-3 text-sm font-semibold focus:outline-none focus:border-black text-center"
                        value={editPaymentForm.expiry}
                        onChange={(e) => setEditPaymentForm({ ...editPaymentForm, expiry: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1">CVV / Security Code</label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="•••"
                        className="w-full h-11 border border-neutral-200 rounded-lg px-3 text-sm font-semibold focus:outline-none focus:border-black text-center"
                        value={editPaymentForm.cvv}
                        onChange={(e) => setEditPaymentForm({ ...editPaymentForm, cvv: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-12 bg-neutral-950 text-white font-display font-black text-xs uppercase tracking-widest rounded-lg transition mt-2"
                  >
                    Authorize New Card
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Order Success Full-Screen Transition Overlay */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center select-none"
            >
              <div className="w-18 h-18 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6 scale-110">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>

              <div className="space-y-2 max-w-sm">
                <div className="flex items-center justify-center gap-1.5 text-xs text-amber-500 font-extrabold uppercase tracking-widest">
                  <Sparkles className="w-4 h-4 fill-amber-500" />
                  <span>Order Confirmed</span>
                  <Sparkles className="w-4 h-4 fill-amber-500" />
                </div>
                <h2 className="font-display font-[900] text-2xl text-neutral-950 uppercase tracking-tight">
                  THANK YOU FOR YOUR PURCHASE!
                </h2>
                <p className="text-neutral-500 text-sm font-medium leading-relaxed pt-1">
                  Your premium selection is being prepared for hyper-speed dispatch. Order details sent securely to your email.
                </p>
                
                {/* Order meta badge */}
                <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-3.5 mt-5 font-mono text-xs font-bold text-neutral-600 space-y-1">
                  <p>Order Reference: <span className="text-neutral-950 font-black">{successOrderNumber}</span></p>
                  <p>Express Shipping: <span className="text-[#0a46e4] font-black">ACTIVE</span></p>
                  <p>Payment Mode: <span className={stripeSimulated ? "text-amber-600 font-black uppercase" : "text-emerald-600 font-black uppercase"}>{stripeSimulated ? "Simulated Stripe Test" : "Secured by Stripe"}</span></p>
                </div>
              </div>

              <div className="mt-8 w-full max-w-xs">
                <motion.button
                  id="success-checkout-continue-btn"
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCloseAndGoHome}
                  className="w-full h-13 bg-neutral-950 hover:bg-neutral-900 text-white font-display font-black text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-2"
                >
                  <span>CONTINUE SHOPPING</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
