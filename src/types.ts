export type Category = 'ALL' | 'RUNNING' | 'BASKETBALL' | 'TRAINING' | 'LIFESTYLE' | 'CUSTOM' | 'SLIDES';

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  rating: number;
  reviewsCount: number;
  image: string;
  description: string;
  isNewDrop?: boolean;
  specs: string[];
  colors: string[];
}

export interface CartItem {
  product: Product;
  selectedSize: number;
  selectedColor: string;
  quantity: number;
}

export interface UserProfile {
  email: string;
  fullName: string;
  isNewUser: boolean;
  joinedDate: string;
  preferredSize: number;
  promoCodeUsed?: string;
  favorites: string[]; // List of product IDs
  orderHistory: Order[];
}

export interface Order {
  id: string;
  date: string;
  items: {
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
    size: number;
    color: string;
  }[];
  total: number;
  status: 'Delivered' | 'In Transit' | 'Processing';
}
