export type Category = 'Veg' | 'Non-Veg' | 'Beverages' | 'Soft Drinks';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: Category;
  description: string;
  image: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export type OrderStatus = 'Received' | 'Preparing' | 'Ready' | 'Completed';

export interface Order {
  id: string;
  token: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  timestamp: number;
  estimatedMinutes: number;
}
