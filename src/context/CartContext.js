import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from './NotificationContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const { showNotification } = useNotification();

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1, variant = null) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => 
        item.productId === product._id && 
        (!variant || item.variantId === variant._id)
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > (variant?.stock || product.stock)) {
          showNotification('Not enough stock available', 'error');
          return prevItems;
        }
        return prevItems.map(item =>
          item === existingItem
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      if (quantity > (variant?.stock || product.stock)) {
        showNotification('Not enough stock available', 'error');
        return prevItems;
      }

      return [...prevItems, {
        productId: product._id,
        variantId: variant?._id,
        name: product.name,
        variantName: variant?.name,
        price: variant?.price || product.price,
        quantity,
        image: product.images[0],
        vendor: product.vendor,
        maxStock: variant?.stock || product.stock
      }];
    });

    showNotification('Product added to cart', 'success');
  };

  const updateQuantity = (productId, variantId = null, quantity) => {
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.productId === productId && item.variantId === variantId) {
          if (quantity > item.maxStock) {
            showNotification('Not enough stock available', 'error');
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId, variantId = null) => {
    setCartItems(prevItems => 
      prevItems.filter(item => 
        !(item.productId === productId && item.variantId === variantId)
      )
    );
    showNotification('Product removed from cart', 'success');
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const getTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotal,
      getItemCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext); 