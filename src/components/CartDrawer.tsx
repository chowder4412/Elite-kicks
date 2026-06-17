import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, Tag, ChevronRight, Check } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onCheckout: (appliedPromo?: string, finalTotal?: number) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  const [promoCode, setPromoCode] = useState('');
  const [activeDiscount, setActiveDiscount] = useState<number>(0); // 0.20 for 20%
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Settle checkout slider position state
  const [sliderPos, setSliderPos] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shipping = subtotal > 150 ? 0 : subtotal === 0 ? 0 : 15.0;
  const discountAmount = subtotal * activeDiscount;
  const total = subtotal - discountAmount + shipping;

  const handleApplyPromo = () => {
    setPromoError('');
    if (promoCode.trim().toUpperCase() === 'ELITE20') {
      setActiveDiscount(0.2);
      setPromoApplied(true);
    } else {
      setPromoError('Invalid promo code. Try "ELITE20"');
    }
  };

  const handleDragSlider = (_: any, info: any) => {
    const maxX = 180; // Limit of dragging width
    if (info.point.x - info.initialPoint.x >= maxX) {
      triggerPurchase();
    }
  };

  const triggerPurchase = () => {
    if (cartItems.length === 0 || isCheckingOut) return;
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      onCheckout(promoApplied ? 'ELITE20' : undefined, total);
      onClose();
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Cart Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 200 }}
            className="relative w-full max-w-md bg-neutral-900 border-l border-neutral-800 text-white h-full flex flex-col shadow-2xl z-10"
          >
            {/* Header */}
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-xl uppercase tracking-wider text-white">
                  My Cart
                </span>
                <span className="bg-blue-600 font-mono text-xs font-bold px-2 py-0.5 rounded-full">
                  {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
                </span>
              </div>
              <button
                id="close-cart-btn"
                onClick={onClose}
                className="w-10 h-10 rounded-full border border-neutral-850 hover:bg-neutral-800 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-neutral-400 hover:text-white" />
              </button>
            </div>

            {/* Cart content list */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {orderComplete ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                    <Check className="w-8 h-8 text-white stroke-[3px]" />
                  </div>
                  <h3 className="font-display font-black text-xl tracking-wider uppercase text-white">
                    Order Confirmed!
                  </h3>
                  <p className="text-neutral-400 text-sm max-w-xs">
                    Get ready to launch. Your elite kicks are being dispatched to the packaging depot.
                  </p>
                </motion.div>
              ) : cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-neutral-850 flex items-center justify-center text-neutral-500">
                    <Trash2 className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="font-display font-bold text-neutral-300">Your cart is empty</h3>
                  <p className="text-neutral-505 text-xs max-w-[200px] text-neutral-500 leading-relaxed">
                    Browse our trending catalog and add high-performance gear to your training kit.
                  </p>
                </div>
              ) : (
                cartItems.map((item, index) => (
                  <motion.div
                    key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="flex gap-4 p-3 bg-neutral-850 rounded-2xl border border-neutral-800/60"
                  >
                    {/* Item Image */}
                    <div className="w-20 h-20 bg-neutral-800 rounded-xl flex items-center justify-center shrink-0 p-2 overflow-hidden shadow-sm">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.1)]"
                      />
                    </div>

                    {/* Item Text Details */}
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-display font-extrabold text-sm text-neutral-100 uppercase line-clamp-1 leading-tight">
                            {item.product.name}
                          </h4>
                          <button
                            id={`remove-cart-item-${index}`}
                            onClick={() => onRemoveItem(index)}
                            className="text-neutral-500 hover:text-red-400 p-0.5 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 text-[11px] text-neutral-400 font-semibold uppercase">
                          <span>Size: {item.selectedSize}</span>
                          <span className="text-neutral-600">•</span>
                          <span>{item.selectedColor}</span>
                        </div>
                      </div>

                      {/* Quantity & Pricing */}
                      <div className="flex justify-between items-end mt-1">
                        {/* Quantity picker */}
                        <div className="flex items-center bg-neutral-800 rounded-lg p-1 border border-neutral-750">
                          <button
                            id={`decrease-qty-${index}`}
                            onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                            className="w-5 h-5 flex items-center justify-center text-xs text-neutral-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-mono text-xs font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            id={`increase-qty-${index}`}
                            onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                            className="w-5 h-5 flex items-center justify-center text-xs text-neutral-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Product total cost */}
                        <div className="font-mono text-sm font-bold text-white">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Sticky summary & order actions */}
            {cartItems.length > 0 && !orderComplete && (
              <div className="p-6 bg-neutral-950 border-t border-neutral-850 space-y-4">
                {/* Promo Code area */}
                <div className="space-y-1">
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <Tag className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                      <input
                        id="promo-code-input"
                        type="text"
                        placeholder="Promo Code (ELITE20)"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-neutral-600 uppercase"
                      />
                    </div>
                    <button
                      id="apply-promo-btn"
                      onClick={handleApplyPromo}
                      className="px-4 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold rounded-xl transition-all"
                    >
                      Apply
                    </button>
                  </div>
                  {promoApplied && (
                    <p className="text-emerald-400 text-[11px] font-bold">
                      ✓ Promo code Applied: 20% discount applied.
                    </p>
                  )}
                  {promoError && (
                    <p className="text-red-400 text-[11px] font-bold">{promoError}</p>
                  )}
                </div>

                {/* Subtotals breakdown */}
                <div className="space-y-2 text-xs text-neutral-400 border-b border-neutral-850 pb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono text-neutral-200">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  {activeDiscount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Voucher Discount (20%)</span>
                      <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Estimated Shipping</span>
                    <span className="font-mono text-neutral-200">
                      {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-baseline py-1">
                  <span className="font-display font-black text-sm uppercase tracking-wide">
                    Total Order
                  </span>
                  <span className="font-mono text-xl font-black text-white">
                    ${total.toFixed(2)}
                  </span>
                </div>

                {/* Animated Checkout Gesture Indicator */}
                <div className="pt-2">
                  <div className="relative w-full h-14 bg-neutral-900 rounded-2xl border border-neutral-800 flex items-center justify-center p-1 overflow-hidden">
                    {isCheckingOut ? (
                      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400">
                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Verifying with Card Network...</span>
                      </div>
                    ) : (
                      <>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs font-display font-bold uppercase tracking-widest text-neutral-500">
                          {`Slide to purchase →`}
                        </div>

                        <motion.div
                          id="slide-checkout-handle"
                          drag="x"
                          dragConstraints={{ left: 0, right: 280 }}
                          dragElastic={0.05}
                          dragMomentum={false}
                          onDrag={handleDragSlider}
                          onDragEnd={() => setSliderPos(0)}
                          className="absolute left-1 top-1 h-12 w-16 bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing text-white shadow-lg shadow-blue-600/20"
                        >
                          <ChevronRight className="w-5 h-5 animate-pulse" />
                        </motion.div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
