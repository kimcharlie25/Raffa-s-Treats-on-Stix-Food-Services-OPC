import React, { useState } from 'react';
import { ArrowLeft, Save, ArrowUp, ArrowDown } from 'lucide-react';
import { Category } from '../hooks/useCategories';

interface CategoryReorderProps {
  categories: Category[];
  onBack: () => void;
  onSave: (reorderedCategories: Category[]) => Promise<void>;
}

const CategoryReorder: React.FC<CategoryReorderProps> = ({ categories, onBack, onSave }) => {
  const [reorderedCategories, setReorderedCategories] = useState<Category[]>(
    [...categories].sort((a, b) => a.sort_order - b.sort_order)
  );
  const [isSaving, setIsSaving] = useState(false);

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const newCategories = [...reorderedCategories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newCategories.length) {
      [newCategories[index], newCategories[targetIndex]] = [newCategories[targetIndex], newCategories[index]];
      setReorderedCategories(newCategories);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(reorderedCategories);
      alert('Category order saved successfully!');
    } catch (error) {
      alert('Failed to save category order. Please try again.');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

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
              <h1 className="text-2xl font-playfair font-semibold text-black">Reorder Categories</h1>
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
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-playfair font-medium text-black">
              Category Display Order - {reorderedCategories.length} categories
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Use the up/down arrows to reorder categories. The first category will appear first to customers.
            </p>
          </div>

          {reorderedCategories.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">No categories found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reorderedCategories.map((category, index) => (
                <div
                  key={category.id}
                  className="p-6 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 flex-1">
                      <div className="flex flex-col items-center space-y-1">
                        <span className="text-sm font-medium text-gray-600">
                          #{index + 1}
                        </span>
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">
                          {category.icon}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            ID: {category.id}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            category.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {category.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-1 ml-4">
                      <button
                        onClick={() => moveCategory(index, 'up')}
                        disabled={index === 0}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => moveCategory(index, 'down')}
                        disabled={index === reorderedCategories.length - 1}
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

        {/* Preview Section */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-playfair font-medium text-black mb-4">
            Preview - How customers will see categories
          </h3>
          <div className="flex flex-wrap gap-3">
            {reorderedCategories.map((category, index) => (
              <div
                key={category.id}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200"
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="font-medium text-gray-900">{category.name}</span>
                {!category.active && (
                  <span className="text-xs text-red-600">(Inactive)</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryReorder;

