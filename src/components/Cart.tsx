import React from 'react';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { CartItem, MenuItem } from '../types';

interface CartProps {
  cartItems: CartItem[];
  menuItems: MenuItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  onContinueShopping: () => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({
  cartItems,
  menuItems,
  updateQuantity,
  removeFromCart,
  clearCart,
  getTotalPrice,
  onContinueShopping,
  onCheckout
}) => {
  const toTitleCase = (text: string) => {
    return text
      .toLowerCase()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to get menu item details including stock info
  const getMenuItemStock = (cartItem: CartItem) => {
    const menuItem = menuItems.find(item => item.id === cartItem.menuItemId);
    if (!menuItem || !menuItem.trackInventory || menuItem.stockQuantity === null) {
      return { hasStockLimit: false, stockQuantity: null, atMaxStock: false };
    }
    return {
      hasStockLimit: true,
      stockQuantity: menuItem.stockQuantity,
      atMaxStock: cartItem.quantity >= menuItem.stockQuantity
    };
  };

  // Handle increment with stock validation
  const handleIncrement = (item: CartItem) => {
    const stockInfo = getMenuItemStock(item);
    if (stockInfo.hasStockLimit && stockInfo.atMaxStock) {
      // Don't allow increment if at max stock
      return;
    }
    updateQuantity(item.id, item.quantity + 1);
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">☕</div>
          <h2 className="text-2xl font-playfair font-medium text-black mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some delicious items to get started!</p>
          <button
            onClick={onContinueShopping}
            className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition-all duration-200"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onContinueShopping}
          className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Continue Shopping</span>
        </button>
        <h1 className="text-3xl font-lilita text-[color:var(--raffa-dark)]">Your Cart</h1>
        <button
          onClick={clearCart}
          className="text-red-500 hover:text-red-600 transition-colors duration-200"
        >
          Clear All
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        {cartItems.map((item, index) => (
          <div key={item.id} className={`p-6 ${index !== cartItems.length - 1 ? 'border-b border-cream-200' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-[color:var(--raffa-dark)] leading-snug mb-1 break-words">
                  {toTitleCase(item.name)}
                </h3>
                {item.selectedVariation && (
                  <p className="text-sm text-[color:var(--raffa-dark)]/60 mb-0.5">Size: {item.selectedVariation.name}</p>
                )}
                {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                  <p className="text-sm text-[color:var(--raffa-dark)]/60 mb-0.5">
                    Add-ons: {item.selectedAddOns.map(addOn => 
                      addOn.quantity && addOn.quantity > 1 
                        ? `${addOn.name} x${addOn.quantity}`
                        : addOn.name
                    ).join(', ')}
                  </p>
                )}
                <p className="text-xs sm:text-sm text-[color:var(--raffa-dark)]/70">₱{item.totalPrice.toFixed(2)} each</p>
              </div>
              
              <div className="flex items-center space-x-4 ml-4">
                <div className="flex flex-col items-center space-y-1">
                  <div className="flex items-center space-x-3 bg-yellow-100 rounded-full p-1 border border-yellow-300">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-yellow-200 rounded-full transition-colors duration-200"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="font-semibold text-black min-w-[32px] text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleIncrement(item)}
                      disabled={getMenuItemStock(item).atMaxStock}
                      className={`p-2 rounded-full transition-colors duration-200 ${
                        getMenuItemStock(item).atMaxStock
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-yellow-200'
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {getMenuItemStock(item).hasStockLimit && (
                    <div className="text-xs text-gray-600">
                      {getMenuItemStock(item).atMaxStock ? (
                        <span className="text-orange-600 font-medium">Max stock</span>
                      ) : (
                        <span className="text-gray-500">{getMenuItemStock(item).stockQuantity} available</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-semibold text-black">₱{(item.totalPrice * item.quantity).toFixed(2)}</p>
                </div>
                
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between text-2xl font-fredoka font-semibold text-[color:var(--raffa-dark)] mb-6">
          <span>Total:</span>
          <span>₱{Number(getTotalPrice()).toFixed(2)}</span>
        </div>
        
        <button
          onClick={onCheckout}
          className="w-full bg-[color:var(--raffa-red)] text-white py-4 rounded-xl hover:bg-red-700 transition-all duration-200 transform hover:scale-[1.02] font-medium text-lg"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;