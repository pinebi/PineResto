import { create } from 'zustand';
import { Category, Product, CartItem, Order } from '@/types';

interface StoreState {
  // Categories
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  // Products
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Cart
  cart: CartItem[];
  sessionId: string;
  orderType: 'kiosk' | 'online';
  setSessionId: (sessionId: string) => void;
  setOrderType: (orderType: 'kiosk' | 'online') => void;
  loadCart: () => Promise<void>;
  addToCart: (product: Product, quantity?: number, selectedOptions?: { [key: string]: string }, notes?: string) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateCartItemQuantity: (productId: string, quantity: number) => Promise<void>;
  updateCartItemNotes: (productId: string, notes: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  
  // Orders
  orders: Order[];
  addOrder: (order: Order) => void;
  setOrders: (orders: Order[]) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  // Categories
  categories: [],
  setCategories: (categories) => set({ categories }),
  addCategory: (category) => set((state) => ({ 
    categories: [...state.categories, category] 
  })),
  updateCategory: (id, category) => set((state) => ({
    categories: state.categories.map(c => c.id === id ? { ...c, ...category } : c)
  })),
  deleteCategory: (id) => set((state) => ({
    categories: state.categories.filter(c => c.id !== id)
  })),
  
  // Products
  products: [],
  setProducts: (products) => set({ products }),
  addProduct: (product) => set((state) => ({ 
    products: [...state.products, product] 
  })),
  updateProduct: (id, product) => set((state) => ({
    products: state.products.map(p => p.id === id ? { ...p, ...product } : p)
  })),
  deleteProduct: (id) => set((state) => ({
    products: state.products.filter(p => p.id !== id)
  })),
  
  // Cart
  cart: [],
  sessionId: '',
  orderType: 'kiosk',
  setSessionId: (sessionId) => set({ sessionId }),
  setOrderType: (orderType) => set({ orderType }),
  
  loadCart: async () => {
    const { sessionId, orderType } = get();
    if (!sessionId) return;
    
    try {
      const response = await fetch(`/api/cart?sessionId=${sessionId}&orderType=${orderType}`);
      if (response.ok) {
        const cartData = await response.json();
        const cartItems: CartItem[] = cartData.map((item: any) => ({
          product: {
            id: item.product_id,
            name: item.product_name,
            price: item.product_price,
            description: '',
            categoryId: '',
            imageUrl: '',
            emoji: '',
            options: []
          },
          quantity: item.quantity,
          selectedOptions: {},
          notes: item.notes || ''
        }));
        set({ cart: cartItems });
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  },
  
  addToCart: async (product, quantity = 1, selectedOptions = {}, notes = '') => {
    const { sessionId, orderType } = get();
    if (!sessionId) {
      console.error('Session ID not set');
      return;
    }
    
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          product,
          quantity,
          notes,
          orderType
        })
      });
      
      if (response.ok) {
        // Cart'ı yeniden yükle
        await get().loadCart();
      } else {
        console.error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  },
  
  removeFromCart: async (productId) => {
    const { sessionId, orderType } = get();
    if (!sessionId) return;
    
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          productId,
          quantity: 0,
          orderType
        })
      });
      
      if (response.ok) {
        await get().loadCart();
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  },
  
  updateCartItemQuantity: async (productId, quantity) => {
    const { sessionId, orderType } = get();
    if (!sessionId) return;
    
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          productId,
          quantity,
          orderType
        })
      });
      
      if (response.ok) {
        await get().loadCart();
      }
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
    }
  },
  
  updateCartItemNotes: async (productId, notes) => {
    const { sessionId, orderType } = get();
    if (!sessionId) return;
    
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          productId,
          notes,
          orderType
        })
      });
      
      if (response.ok) {
        await get().loadCart();
      }
    } catch (error) {
      console.error('Error updating cart item notes:', error);
    }
  },
  
  clearCart: async () => {
    const { sessionId, orderType } = get();
    if (!sessionId) return;
    
    try {
      const response = await fetch(`/api/cart?sessionId=${sessionId}&orderType=${orderType}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        set({ cart: [] });
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  },
  
  getCartTotal: () => {
    const { cart } = get();
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  },
  
  // Orders
  orders: [],
  addOrder: (order) => set((state) => ({ 
    orders: [...state.orders, order] 
  })),
  setOrders: (orders) => set({ orders }),
}));

