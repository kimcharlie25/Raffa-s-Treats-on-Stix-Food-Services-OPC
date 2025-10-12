import React from 'react';
import { useCategories } from '../hooks/useCategories';

interface DesktopCategoryNavProps {
  activeCategory: string;
  onCategoryClick: (categoryId: string) => void;
}

const DesktopCategoryNav: React.FC<DesktopCategoryNavProps> = ({ activeCategory, onCategoryClick }) => {
  const { categories, loading } = useCategories();

  if (loading) {
    return (
      <div className="hidden md:block bg-white/95 backdrop-blur-sm border-b border-yellow-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-10 flex items-center space-x-2">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden md:block bg-white/95 backdrop-blur-sm border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="overflow-x-auto whitespace-nowrap scrollbar-hide">
          <nav className="inline-flex items-center gap-2 py-2">
            <button
              onClick={() => onCategoryClick('all')}
              className={`flex-shrink-0 inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                activeCategory === 'all'
                  ? 'bg-[color:var(--raffa-yellow)] text-[color:var(--raffa-dark)]'
                  : 'bg-white text-[color:var(--raffa-dark)] border border-yellow-200 hover:bg-yellow-50'
              }`}
            >
              <span className="font-medium">All</span>
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => onCategoryClick(category.id)}
                className={`flex-shrink-0 inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                  activeCategory === category.id
                    ? 'bg-[color:var(--raffa-yellow)] text-[color:var(--raffa-dark)]'
                    : 'bg-white text-[color:var(--raffa-dark)] border border-yellow-200 hover:bg-yellow-50'
                }`}
              >
                <span className="text-base leading-none">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default DesktopCategoryNav;


