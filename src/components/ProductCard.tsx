import { motion } from 'motion/react';
import { Heart, Star } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: any) => void;
  onClick: () => void;
  key?: any;
}

export default function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
  onClick,
}: ProductCardProps) {
  return (
    <motion.div
      id={`shoe-card-${product.id}`}
      layoutId={`card-container-${product.id}`}
      onClick={onClick}
      className="group cursor-pointer flex flex-col bg-white rounded-3xl p-4 shadow-xs relative overflow-hidden transition-shadow duration-300 hover:shadow-xl hover:shadow-black/5"
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Target element image backdrop */}
      <div className="aspect-square w-full rounded-2xl bg-neutral-100 flex items-center justify-center p-2 relative overflow-hidden">
        {/* Floating Category tag (subtle) */}
        <span className="absolute top-3 left-3 text-[10px] bg-neutral-900/10 backdrop-blur-md text-neutral-800 font-bold px-2 py-1 rounded-full uppercase tracking-wider">
          {product.category}
        </span>

        {/* Favorite Icon */}
        <motion.button
          id={`favorite-btn-${product.id}`}
          onClick={(e) => onToggleFavorite(product.id, e)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md z-10 text-neutral-400 hover:text-red-500 hover:scale-110 active:scale-95 transition-all"
          whileTap={{ scale: 0.8 }}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-neutral-600'
            }`}
          />
        </motion.button>

        {/* Shoe Image */}
        <motion.img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="max-h-[85%] max-w-[85%] object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.15)] group-hover:scale-106 duration-300 ease-out"
        />
      </div>

      {/* Info Section */}
      <div className="mt-3 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="font-display font-black text-neutral-900 text-sm tracking-wide uppercase line-clamp-1 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1 text-xs text-neutral-500">
            <Star className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
            <span className="font-medium text-neutral-800">{product.rating}</span>
            <span className="text-neutral-400">({product.reviewsCount})</span>
          </div>
        </div>

        {/* Price */}
        <div className="mt-2 text-base font-mono font-bold text-neutral-900">
          ${product.price.toFixed(2)}
        </div>
      </div>
    </motion.div>
  );
}
