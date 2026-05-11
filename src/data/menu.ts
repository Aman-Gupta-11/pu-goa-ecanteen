import { MenuItem } from '../types';

export const MENU_DATA: MenuItem[] = [
  // Veg Menu
  {
    id: 'v1',
    name: 'Veg Thali',
    price: 80,
    category: 'Veg',
    description: 'Complete meal with Dal, Veggies, Roti, Rice, and Sweet.',
    image: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'v2',
    name: 'Veg Noodles',
    price: 70,
    category: 'Veg',
    description: 'Classic hakka noodles tossed with fresh garden vegetables.',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'v3',
    name: 'Vada Pav',
    price: 20,
    category: 'Veg',
    description: 'The soul of Mumbai street food - spicy potato fritter in a bun.',
    image: 'https://images.unsplash.com/photo-1750767396969-f37060ebe07d?q=80&w=1201&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'v4',
    name: 'Pav Bhaji',
    price: 40,
    category: 'Veg',
    description: 'Buttery mashed mixed veggies served with hot pav.',
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'v5',
    name: 'Paneer Bhurji',
    price: 100,
    category: 'Veg',
    description: 'Scrambled paneer with onions, tomatoes, and aromatic spices.',
    image: 'https://images.unsplash.com/photo-1736239093375-34f0a2f33c7d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'v6',
    name: 'Paneer Kadhai',
    price: 110,
    category: 'Veg',
    description: 'Cubes of paneer cooked in a rich, spicy tomato-based gravy.',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80'
  },

  // Non-Veg Menu
  {
    id: 'nv1',
    name: 'Chicken Noodle',
    price: 120,
    category: 'Non-Veg',
    description: 'Savory noodles with tender chicken chunks and vegetables.',
    image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'nv2',
    name: 'Chicken Fried Rice',
    price: 130,
    category: 'Non-Veg',
    description: 'Signature fried rice with grilled chicken and scallions.',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'nv3',
    name: 'Chicken Chilli',
    price: 150,
    category: 'Non-Veg',
    description: 'Spicy, tangy Indochinese style crispy chicken cubes.',
    image: 'https://plus.unsplash.com/premium_photo-1675864532625-60efd11cde54?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },

  // Beverages
  {
    id: 'b1',
    name: 'Tea',
    price: 10,
    category: 'Beverages',
    description: 'Classic hot masala chai for that perfect break.',
    image: 'https://images.unsplash.com/photo-1634299406775-90f32b656536?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'b2',
    name: 'Coffee',
    price: 20,
    category: 'Beverages',
    description: 'Rich, smooth brewed filter coffee.',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80'
  },

  // Soft Drinks
  {
    id: 'sd1',
    name: 'Maaza',
    price: 20,
    category: 'Soft Drinks',
    description: 'Refreshing mango fruit drink.',
    image: 'https://www.coca-cola.com/content/dam/onexp/in/en/home-page-test-img/brands/maaza/maaza-bottles/maaza_packshot_1100x1100.jpg'
  },
  {
    id: 'sd2',
    name: 'Frooti',
    price: 20,
    category: 'Soft Drinks',
    description: 'Popular Indian mango flavored beverage.',
    image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=1080/da/cms-assets/cms/product/bbea2a7d-3bc7-4818-8725-8572c5663b0d.png?bg_token=color.background.quaternary'
  },
  {
    id: 'sd3',
    name: 'Mirinda',
    price: 45,
    category: 'Soft Drinks',
    description: 'Vibrant orange flavored sparkling soda.',
    image: 'https://www.bbassets.com/media/uploads/p/l/40094180_11-mirinda-soft-drink.jpg'
  },
  {
    id: 'sd4',
    name: 'Mountain Dew',
    price: 50,
    category: 'Soft Drinks',
    description: 'Energizing citrus flavored soft drink.',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80'
  }
];
