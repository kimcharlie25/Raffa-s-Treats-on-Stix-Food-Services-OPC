import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface FloatingCartButtonProps {
  itemCount: number;
  onCartClick: () => void;
}

const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ itemCount, onCartClick }) => {
  if (itemCount === 0) return null;

  return (
    <button
      onClick={onCartClick}
      className="fixed bottom-6 right-6 bg-[color:var(--raffa-red)] text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-all duration-200 transform hover:scale-110 z-40 md:hidden"
    >
      <div className="relative">
        <ShoppingCart className="h-6 w-6" />
        <span className="absolute -top-2 -right-2 bg-[color:var(--raffa-yellow)] text-[color:var(--raffa-dark)] text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {itemCount}
        </span>
      </div>
    </button>
  );
};

export default FloatingCartButton;