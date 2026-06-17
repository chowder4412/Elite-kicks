import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronDown, Heart, ShoppingBag, ArrowLeft, ShieldCheck, Leaf, Truck } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailsProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: any) => void;
  onAddToCart: (product: Product, size: number, color: string) => void;
}

export default function ProductDetails({
  product,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
}: ProductDetailsProps) {
  const [selectedSize, setSelectedSize] = useState<number>(10); // Matches size 10 pre-selected in mockup
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [activeAccordion, setActiveAccordion] = useState<'technology' | 'sustainability' | 'shipping' | null>(null);

  if (!product) return null;

  // Colors mapping logic to render exact hex colors like the mockup screenshot
  const colorList = product.colors || ['Electric Blue', 'Stealth Black', 'Rocket Red'];
  const activeColor = selectedColor || colorList[0];

  const getColorHex = (colorName: string) => {
    const lower = colorName.toLowerCase();
    if (lower.includes('blue')) return '#0a46e4';
    if (lower.includes('black') || lower.includes('dark') || lower.includes('phantom')) return '#1c1e21';
    if (lower.includes('red') || lower.includes('crimson')) return '#dc2626';
    if (lower.includes('green') || lower.includes('lime') || lower.includes('volt')) return '#22c55e';
    if (lower.includes('orange') || lower.includes('bronze')) return '#f97316';
    if (lower.includes('teal')) return '#06b6d4';
    if (lower.includes('white') || lower.includes('alabaster')) return '#e5e7eb';
    return '#888888';
  };

  const US_SIZES = [7, 8, 9, 10, 11, 12, 13, 14];

  const handleAdd = () => {
    onAddToCart(product, selectedSize, activeColor);
  };

  const toggleAccordion = (section: 'technology' | 'sustainability' | 'shipping') => {
    if (activeAccordion === section) {
      setActiveAccordion(null);
    } else {
      setActiveAccordion(section);
    }
  };

  // Human category helper to print category EXACTLY like the mockup uploaded
  const getSubTitleCategory = (cat: string) => {
    if (cat === 'RUNNING') return 'PERFORMANCE RUNNING';
    if (cat === 'BASKETBALL') return 'ELITE BASKETBALL';
    if (cat === 'TRAINING') return 'TRAINING & ATHLETICS';
    if (cat === 'LIFESTYLE') return 'STREET LIFESTYLE';
    if (cat === 'CUSTOM') return 'HANDCRAFTED NATIVE WEAR';
    if (cat === 'SLIDES') return 'PREMIUM LIFESTYLE SLIDES';
    return cat;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-end sm:items-center justify-center">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-xs"
          />

          {/* Modal Container scaled like a pristine mobile frame */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="relative bg-white text-neutral-900 w-full max-w-md h-full sm:h-[92vh] sm:rounded-t-[2rem] shadow-2xl flex flex-col overflow-hidden z-10"
          >
            {/* Custom Top Navigation header */}
            <div className="sticky top-0 bg-white px-5 py-3.5 flex items-center justify-between border-b border-neutral-100 z-10">
              <button
                id="back-to-dashboard-btn"
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-700 transition-colors"
                title="Back to Catalog"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <h2 className="font-display font-extrabold text-sm uppercase tracking-widest text-neutral-900">
                ELITE KICKS
              </h2>

              <button
                id="toggle-fav-detail-btn"
                onClick={(e) => onToggleFavorite(product.id, e)}
                className="w-10 h-10 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-700 transition-colors"
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isFavorite ? 'fill-red-500 text-red-500' : 'text-neutral-500'
                  }`}
                />
              </button>
            </div>

            {/* Scrollable Content Stage */}
            <div className="flex-grow overflow-y-auto pb-28">
              {/* Image Hero Stage exactly mapping the top part of screenshot */}
              <div className="relative w-full aspect-[4/3.1] bg-[#f2f4f7] overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-80" />
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="max-h-[82%] max-w-[85%] object-contain drop-shadow-[0_15px_22px_rgba(0,0,0,0.12)] z-10"
                />
              </div>

              {/* White body content sheet */}
              <div className="p-6 space-y-6 bg-white text-left">
                {/* Category header & Title & Price */}
                <div className="space-y-1">
                  <span className="text-xs font-display font-black text-[#0a46e4] tracking-widest uppercase">
                    {getSubTitleCategory(product.category)}
                  </span>
                  <h1 className="font-display font-[900] text-2xl text-neutral-950 uppercase tracking-tight leading-tight">
                    {product.name}
                  </h1>
                  <p className="font-display font-extrabold text-lg text-neutral-900 pt-0.5">
                    ${product.price.toFixed(2)}
                  </p>
                </div>

                {/* Body paragraph description */}
                <p className="text-neutral-600 text-sm leading-relaxed antialiased font-normal">
                  {product.description}
                </p>

                {/* Custom Color selection layout */}
                <div className="space-y-3">
                  <h3 className="font-display font-black text-xs tracking-wider text-black uppercase">
                    Select Color
                  </h3>
                  <div className="flex items-center gap-4">
                    {colorList.map((color) => {
                      const isColorActive = activeColor === color;
                      const hexColor = getColorHex(color);
                      return (
                        <button
                          id={`color-option-${color.replace(/\s+/g, '-')}`}
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className="relative flex items-center justify-center p-1 transition-all"
                          title={color}
                        >
                          {/* Inner solid sphere */}
                          <div
                            className="w-10 h-10 rounded-full border border-black/15 shadow-inner"
                            style={{ backgroundColor: hexColor }}
                          />
                          {/* Selected outer double ring alignment */}
                          {isColorActive && (
                            <div 
                              className="absolute inset-x-0 inset-y-0 border-[2.5px] rounded-full scale-120 animate-pulse"
                              style={{ borderColor: hexColor }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Size choice block styled exactly like the screenshot with SIZE GUIDE link */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-black text-xs tracking-wider text-black uppercase">
                      Size (US Men's)
                    </h3>
                    <button
                      id="size-guide-modal-opener"
                      onClick={() => alert(`Brand fit assistant: US Men's athletic sizing runs true for standard D-widths.`)}
                      className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider underline hover:text-black transition-colors"
                    >
                      Size Guide
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {US_SIZES.map((size) => {
                      const isSizeActive = selectedSize === size;
                      const isSizeDisabled = size === 14; // Disable US Size 14 like in mockup screenshot status

                      return (
                        <button
                          id={`size-selection-${size}`}
                          key={size}
                          disabled={isSizeDisabled}
                          onClick={() => setSelectedSize(size)}
                          className={`h-11 rounded-lg border text-xs font-bold transition-all flex items-center justify-center ${
                            isSizeDisabled
                              ? 'bg-neutral-50 border-neutral-150 text-neutral-300 opacity-40 cursor-not-allowed'
                              : isSizeActive
                                ? 'bg-neutral-950 border-neutral-950 text-white shadow-md font-black'
                                : 'bg-white border-neutral-200 text-neutral-800 hover:border-neutral-400'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Expandable Accordions Mapping to Technology, Sustainability, Shipping */}
                <div className="border-t border-b border-neutral-100 divide-y divide-neutral-100 mt-6 select-none">
                  {/* Technology Accordion */}
                  <div className="py-4">
                    <button
                      id="accordion-technology-btn"
                      onClick={() => toggleAccordion('technology')}
                      className="w-full flex items-center justify-between font-display font-black text-xs tracking-widest text-black uppercase hover:opacity-80 transition-opacity"
                    >
                      <span>Technology</span>
                      {activeAccordion === 'technology' ? (
                        <ChevronDown className="w-4 h-4 text-neutral-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-neutral-500" />
                      )}
                    </button>
                    <AnimatePresence initial={false}>
                      {activeAccordion === 'technology' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3 text-xs text-neutral-600 space-y-2 leading-relaxed">
                            <p className="flex items-start gap-2">
                              <ShieldCheck className="w-4 h-4 text-[#0a46e4] shrink-0 mt-0.5" />
                              <span>Nitrogen-infused foam core provides unmatched vertical spring-back ratio and lightweight shock protection.</span>
                            </p>
                            <p className="flex items-start gap-2">
                              <ShieldCheck className="w-4 h-4 text-[#0a46e4] shrink-0 mt-0.5" />
                              <span>Guardi-lock composite carbon fiber speedplate ensures stability during fast lateral cut shifts.</span>
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Sustainability Accordion */}
                  <div className="py-4">
                    <button
                      id="accordion-sustainability-btn"
                      onClick={() => toggleAccordion('sustainability')}
                      className="w-full flex items-center justify-between font-display font-black text-xs tracking-widest text-black uppercase hover:opacity-80 transition-opacity"
                    >
                      <span>Sustainability</span>
                      {activeAccordion === 'sustainability' ? (
                        <ChevronDown className="w-4 h-4 text-neutral-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-neutral-500" />
                      )}
                    </button>
                    <AnimatePresence initial={false}>
                      {activeAccordion === 'sustainability' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3 text-xs text-neutral-600 space-y-2 leading-relaxed">
                            <p className="flex items-start gap-2">
                              <Leaf className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>Crafted with at least 35% recycled technical mesh and plant-based non-toxic adhesives.</span>
                            </p>
                            <p className="flex items-start gap-2">
                              <Leaf className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>Packaging is 100% biodegradable and derived from responsibly managed FSC commercial pine wood forests.</span>
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Shipping Accordion */}
                  <div className="py-4">
                    <button
                      id="accordion-shipping-btn"
                      onClick={() => toggleAccordion('shipping')}
                      className="w-full flex items-center justify-between font-display font-black text-xs tracking-widest text-black uppercase hover:opacity-80 transition-opacity"
                    >
                      <span>Shipping & Returns</span>
                      {activeAccordion === 'shipping' ? (
                        <ChevronDown className="w-4 h-4 text-neutral-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-neutral-500" />
                      )}
                    </button>
                    <AnimatePresence initial={false}>
                      {activeAccordion === 'shipping' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3 text-xs text-neutral-600 space-y-2 leading-relaxed">
                            <p className="flex items-start gap-2">
                              <Truck className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                              <span>Standard Domestic dispatch: Free delivery within 3-5 business days.</span>
                            </p>
                            <p className="flex items-start gap-2">
                              <Truck className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                              <span>Hassle-free 30-day wear-and-test guarantee. Return in any clean athletic condition.</span>
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* Persistent bottom action menu styled identical to screenshot */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 p-5 flex gap-4 items-center z-20 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
              {/* Add to Cart button */}
              <motion.button
                id="add-to-cart-action-btn"
                whileTap={{ scale: 0.98 }}
                onClick={handleAdd}
                className="flex-grow h-13 bg-neutral-950 hover:bg-neutral-900 text-white font-display uppercase tracking-widest text-xs font-black rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <span>ADD TO CART</span>
                <ShoppingBag className="w-4 h-4 stroke-[2.5px]" />
              </motion.button>

              {/* Heart favorite icon button */}
              <button
                id="favorite-btn-bottom-bar"
                onClick={(e) => onToggleFavorite(product.id, e)}
                className="w-13 h-13 rounded-lg border border-neutral-200 bg-white flex items-center justify-center hover:bg-neutral-50 transition-colors cursor-pointer"
                title="Save product"
              >
                <Heart
                  className={`w-5 h-5 transition-transform active:scale-110 ${
                    isFavorite ? 'fill-red-500 text-red-500' : 'text-neutral-900'
                  }`}
                />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

