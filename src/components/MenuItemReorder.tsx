import React, { useState } from 'react';
import { ArrowLeft, Save, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { MenuItem } from '../types';
import { useCategories } from '../hooks/useCategories';

interface MenuItemReorderProps {
  items: MenuItem[];
  onBack: () => void;
  onSave: (category: string, reorderedItems: MenuItem[]) => Promise<void>;
}

const MenuItemReorder: React.FC<MenuItemReorderProps> = ({ items, onBack, onSave }) => {
  const { categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.id || '');
  const [reorderedItems, setReorderedItems] = useState<MenuItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize reordered items when category changes
  React.useEffect(() => {
    if (selectedCategory) {
      const categoryItems = items
        .filter(item => item.category === selectedCategory)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setReorderedItems(categoryItems);
    }
  }, [selectedCategory, items]);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...reorderedItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newItems.length) {
      [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
      setReorderedItems(newItems);
    }
  };

  const handleSave = async () => {
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }

    try {
      setIsSaving(true);
      await onSave(selectedCategory, reorderedItems);
      alert('Menu order saved successfully!');
    } catch (error) {
      alert('Failed to save menu order. Please try again.');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCategoryName = categories.find(cat => cat.id === selectedCategory)?.name || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </button>
              <h1 className="text-2xl font-playfair font-semibold text-black">Reorder Menu Items</h1>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save Order'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Category Selector */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-black mb-3">
            Select Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Items List */}
        {selectedCategory && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-playfair font-medium text-black">
                {selectedCategoryName} - {reorderedItems.length} items
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Use the up/down arrows to reorder items. The first item will appear first to customers.
              </p>
            </div>

            {reorderedItems.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">No items in this category</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {reorderedItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex items-center space-x-2 text-gray-400">
                          <GripVertical className="h-5 w-5" />
                          <span className="text-sm font-medium text-gray-600">
                            #{index + 1}
                          </span>
                        </div>
                        
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-sm font-semibold text-gray-900">
                              ₱{item.basePrice.toFixed(2)}
                            </span>
                            {item.popular && (
                              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                                Popular
                              </span>
                            )}
                            {!item.available && (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                                Unavailable
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-1 ml-4">
                        <button
                          onClick={() => moveItem(index, 'up')}
                          disabled={index === 0}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => moveItem(index, 'down')}
                          disabled={index === reorderedItems.length - 1}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuItemReorder;

