import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { FoodItem, CartItem, BillBreakdown } from '../types';
import { calculateBill } from '../utils/pricing';
import { useToast } from './ToastContext';
import { api } from '../services/api';

interface CartContextType {
  items: CartItem[];
  addToCart: (food: FoodItem, quantity?: number) => boolean;
  removeFromCart: (foodId: string) => void;
  updateQuantity: (foodId: string, quantity: number) => void;
  clearCart: () => void;
  totalItemsCount: number;
  bill: BillBreakdown;
  couponCode: string;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  useRewardPoints: boolean;
  setUseRewardPoints: (use: boolean) => void;
  isItemInCutoff: (food: FoodItem) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'mealmate_cart_v1';
const COUPON_STORAGE_KEY = 'mealmate_applied_coupon_v1';
const REWARD_STORAGE_KEY = 'mealmate_applied_reward_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [couponCode, setCouponCode] = useState<string>(() => {
    try {
      return localStorage.getItem(COUPON_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });

  const [useRewardPoints, setUseRewardPointsState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(REWARD_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const { showToast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Hydrate cart from backend MySQL database on login
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      api.getCart().then(res => {
        if (res?.success && res.cart && Array.isArray(res.cart.items) && res.cart.items.length > 0) {
          const loadedItems: CartItem[] = res.cart.items.map((it: any) => ({
            foodItem: {
              id: it.foodId,
              name: it.name,
              price: it.price,
              originalPrice: it.originalPrice,
              image: it.image,
              sellerId: it.sellerId,
              sellerName: it.sellerName,
              module: it.module,
              isVeg: it.isVeg,
              stockQuantity: it.stockQuantity,
              isAvailable: it.isAvailable,
              category: 'Campus Dish',
              categoryId: 'cat-lunch',
              prepTimeMinutes: 20,
              rating: 4.8,
              reviewCount: 25
            },
            quantity: it.quantity
          }));
          setItems(loadedItems);
          if (res.cart.couponCode) setCouponCode(res.cart.couponCode);
          if (res.cart.useRewardPoints !== undefined) setUseRewardPointsState(res.cart.useRewardPoints);
        }
      }).catch(err => {
        console.warn('Backend cart hydration notice:', err);
      });
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Error saving cart', err);
    }
  }, [items]);

  useEffect(() => {
    try {
      if (couponCode) {
        localStorage.setItem(COUPON_STORAGE_KEY, couponCode);
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (err) {
      console.error('Error saving coupon', err);
    }
  }, [couponCode]);

  useEffect(() => {
    try {
      if (useRewardPoints) {
        localStorage.setItem(REWARD_STORAGE_KEY, 'true');
      } else {
        localStorage.removeItem(REWARD_STORAGE_KEY);
      }
    } catch (err) {
      console.error('Error saving reward state', err);
    }
  }, [useRewardPoints]);

  const setUseRewardPoints = (use: boolean) => {
    setUseRewardPointsState(use);
    if (isAuthenticated && user?.id) {
      api.setCartLoyalty(use).catch(e => console.warn('Cart loyalty sync notice:', e));
    }
  };

  const isItemInCutoff = (food: FoodItem): boolean => {
    if (food.module === 'SaveMyMeal' && food.cutoffTime) {
      const cutoff = new Date(food.cutoffTime).getTime();
      return Date.now() > cutoff;
    }
    return false;
  };

  const addToCart = (food: FoodItem, quantity = 1): boolean => {
    if (!isAuthenticated || !user) {
      showToast('Please sign in or create an account to order food.', 'warning');
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      navigate(`/login?redirect=${returnUrl}`);
      return false;
    }

    if (food.stockQuantity <= 0 || !food.isAvailable) {
      showToast(`Sorry, "${food.name}" is currently sold out!`, 'error');
      return false;
    }

    if (isItemInCutoff(food)) {
      showToast(`Cutoff time passed for "${food.name}". Orders are closed!`, 'error');
      return false;
    }

    let success = true;
    setItems(prev => {
      const existingIndex = prev.findIndex(item => item.foodItem.id === food.id);
      if (existingIndex >= 0) {
        const currentQty = prev[existingIndex].quantity;
        const newQty = currentQty + quantity;

        if (newQty > food.stockQuantity) {
          showToast(`Cannot add more. Max available stock is ${food.stockQuantity}.`, 'warning');
          success = false;
          return prev;
        }

        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        showToast(`Updated quantity for "${food.name}" (${newQty})`, 'success');
        return updated;
      } else {
        if (quantity > food.stockQuantity) {
          showToast(`Only ${food.stockQuantity} portions available!`, 'warning');
          success = false;
          return prev;
        }
        showToast(`Added "${food.name}" to cart`, 'success');
        return [...prev, { foodItem: food, quantity }];
      }
    });

    if (success && isAuthenticated && user?.id) {
      api.addCartItem(food.id, quantity).catch(e => console.warn('Cart sync notice:', e));
    }

    return success;
  };

  const updateQuantity = (foodId: string, quantity: number) => {
    if (!isAuthenticated || !user) {
      showToast('Please sign in or create an account to order food.', 'warning');
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      navigate(`/login?redirect=${returnUrl}`);
      return;
    }
    if (quantity <= 0) {
      removeFromCart(foodId);
      return;
    }

    setItems(prev => {
      return prev.map(item => {
        if (item.foodItem.id === foodId) {
          if (quantity > item.foodItem.stockQuantity) {
            showToast(`Max stock for ${item.foodItem.name} is ${item.foodItem.stockQuantity}`, 'warning');
            return { ...item, quantity: item.foodItem.stockQuantity };
          }
          return { ...item, quantity };
        }
        return item;
      });
    });

    if (isAuthenticated && user?.id) {
      api.updateCartItemQuantity(foodId, quantity).catch(e => console.warn('Cart update notice:', e));
    }
  };

  const removeFromCart = (foodId: string) => {
    setItems(prev => {
      const target = prev.find(i => i.foodItem.id === foodId);
      if (target) {
        showToast(`Removed "${target.foodItem.name}" from cart`, 'info');
      }
      return prev.filter(i => i.foodItem.id !== foodId);
    });

    if (isAuthenticated && user?.id) {
      api.removeCartItem(foodId).catch(e => console.warn('Cart item remove notice:', e));
    }
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode('');
    setUseRewardPointsState(false);
    showToast('Cart cleared', 'info');

    if (isAuthenticated && user?.id) {
      api.clearCart().catch(e => console.warn('Cart clear notice:', e));
    }
  };

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'MEAL10') {
      const currentBill = calculateBill(items, '', useRewardPoints);
      if (currentBill.itemTotal < 100) {
        return { success: false, message: 'MEAL10 requires minimum item total of ₹100' };
      }
      setCouponCode('MEAL10');
      if (isAuthenticated && user?.id) api.applyCartCoupon('MEAL10').catch(() => {});
      return { success: true, message: 'Coupon MEAL10 applied! 10% off' };
    }

    if (cleanCode === 'COLLEGE20') {
      const currentBill = calculateBill(items, '', useRewardPoints);
      if (currentBill.itemTotal < 150) {
        return { success: false, message: 'COLLEGE20 requires minimum item total of ₹150' };
      }
      setCouponCode('COLLEGE20');
      if (isAuthenticated && user?.id) api.applyCartCoupon('COLLEGE20').catch(() => {});
      return { success: true, message: 'Coupon COLLEGE20 applied! 20% off' };
    }

    if (cleanCode === 'WELCOME50') {
      const currentBill = calculateBill(items, '', useRewardPoints);
      if (currentBill.itemTotal < 150) {
        return { success: false, message: 'WELCOME50 requires minimum item total of ₹150' };
      }
      setCouponCode('WELCOME50');
      if (isAuthenticated && user?.id) api.applyCartCoupon('WELCOME50').catch(() => {});
      return { success: true, message: 'Coupon WELCOME50 applied! ₹50 off' };
    }

    if (cleanCode === 'CAMPUS20') {
      const currentBill = calculateBill(items, '', useRewardPoints);
      if (currentBill.itemTotal < 100) {
        return { success: false, message: 'CAMPUS20 requires minimum item total of ₹100' };
      }
      setCouponCode('CAMPUS20');
      if (isAuthenticated && user?.id) api.applyCartCoupon('CAMPUS20').catch(() => {});
      return { success: true, message: 'Coupon CAMPUS20 applied! 20% off' };
    }

    if (cleanCode === 'FREEDEL') {
      const currentBill = calculateBill(items, '', useRewardPoints);
      if (currentBill.itemTotal < 80) {
        return { success: false, message: 'FREEDEL requires minimum item total of ₹80' };
      }
      setCouponCode('FREEDEL');
      if (isAuthenticated && user?.id) api.applyCartCoupon('FREEDEL').catch(() => {});
      return { success: true, message: 'Coupon FREEDEL applied! Free Delivery' };
    }

    return { success: false, message: 'Invalid or expired coupon code. Try WELCOME50, CAMPUS20, or MEAL10.' };
  };

  const removeCoupon = () => {
    setCouponCode('');
    showToast('Coupon removed', 'info');
    if (isAuthenticated && user?.id) {
      api.applyCartCoupon('').catch(() => {});
    }
  };

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const bill = calculateBill(items, couponCode, useRewardPoints);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItemsCount,
        bill,
        couponCode,
        applyCoupon,
        removeCoupon,
        useRewardPoints,
        setUseRewardPoints,
        isItemInCutoff,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
