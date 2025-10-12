import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useCategories } from '../hooks/useCategories';

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
  onMenuClick: () => void;
  onCategoryClick?: (categoryId: string) => void;
  selectedCategory?: string;
}

const Header: React.FC<HeaderProps> = ({ cartItemsCount, onCartClick, onMenuClick, onCategoryClick, selectedCategory }) => {
  const { siteSettings, loading } = useSiteSettings();
  const { categories, loading: categoriesLoading } = useCategories();

  return (
    <header className="sticky top-0 z-50 bg-[color:var(--raffa-red)] text-white backdrop-blur-sm border-b border-[rgba(0,0,0,0.05)] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button 
            onClick={onMenuClick}
            className="flex items-center space-x-2 text-white hover:opacity-90 transition-opacity duration-200"
          >
            {loading ? (
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            ) : (
              <img 
                src={siteSettings?.site_logo || "/logo.jpg"} 
                alt={siteSettings?.site_name || "Raffa’s Treats on Stix"}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/logo.jpg";
                }}
              />
            )}
            <h1 className="text-2xl font-lilita">
              {loading ? (
                <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
              ) : (
                siteSettings?.site_name || "Raffa’s Treats on Stix"
              )}
            </h1>
          </button>
          
          {/* Desktop category chips removed; now shown in separate DesktopCategoryNav */}

          {/* Mobile: no category dropdown; keep actions minimal */}
          <div className="md:hidden" />
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={onCartClick}
              className="relative p-2 text-white hover:text-white/90 hover:bg-white/10 rounded-full transition-all duration-200"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[color:var(--raffa-yellow)] text-[color:var(--raffa-dark)] text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce-gentle border border-[color:var(--raffa-dark)]/10">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;