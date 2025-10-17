import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, ArrowLeft, GripVertical, ArrowUpDown, AlertTriangle } from 'lucide-react';
import { useCategories, Category } from '../hooks/useCategories';
import CategoryReorder from './CategoryReorder';
import { supabase } from '../lib/supabase';

interface CategoryManagerProps {
  onBack: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ onBack }) => {
  const { categories, addCategory, updateCategory, deleteCategory, reorderCategories, refetch } = useCategories();
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit' | 'reorder'>('list');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    icon: '☕',
    sort_order: 0,
    active: true
  });

  // Delete confirmation dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [itemCount, setItemCount] = useState(0);
  const [deleteAction, setDeleteAction] = useState<'delete' | 'move'>('delete');
  const [moveToCategory, setMoveToCategory] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all categories (including inactive) for admin view
  useEffect(() => {
    refetch(true); // true = include inactive categories
  }, []);

  const handleAddCategory = () => {
    const nextSortOrder = Math.max(...categories.map(c => c.sort_order), 0) + 1;
    setFormData({
      id: '',
      name: '',
      icon: '☕',
      sort_order: nextSortOrder,
      active: true
    });
    setCurrentView('add');
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      id: category.id,
      name: category.name,
      icon: category.icon,
      sort_order: category.sort_order,
      active: category.active
    });
    setCurrentView('edit');
  };

  const handleDeleteCategory = async (category: Category) => {
    // Check how many items are in this category
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('id')
      .eq('category', category.id);
    
    const count = menuItems?.length || 0;
    setItemCount(count);
    setCategoryToDelete(category);
    
    // Set default move-to category to the first available category (excluding the one being deleted)
    const otherCategories = categories.filter(c => c.id !== category.id);
    if (otherCategories.length > 0) {
      setMoveToCategory(otherCategories[0].id);
    }
    
    setShowDeleteDialog(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setIsDeleting(true);
      
      if (deleteAction === 'move' && itemCount > 0) {
        await deleteCategory(categoryToDelete.id, moveToCategory);
      } else {
        await deleteCategory(categoryToDelete.id);
      }
      
      setShowDeleteDialog(false);
      setCategoryToDelete(null);
      setItemCount(0);
      setDeleteAction('delete');
      setMoveToCategory('');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setCategoryToDelete(null);
    setItemCount(0);
    setDeleteAction('delete');
    setMoveToCategory('');
  };

  const handleSaveCategory = async () => {
    if (!formData.id || !formData.name || !formData.icon) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate ID format (kebab-case)
    const idRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!idRegex.test(formData.id)) {
      alert('Category ID must be in kebab-case format (e.g., "hot-drinks", "cold-beverages")');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await addCategory(formData);
      }
      setCurrentView('list');
      setEditingCategory(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save category');
    }
  };

  const handleCancel = () => {
    setCurrentView('list');
    setEditingCategory(null);
  };

  // Reorder View
  if (currentView === 'reorder') {
    return (
      <CategoryReorder
        categories={categories}
        onBack={() => setCurrentView('list')}
        onSave={reorderCategories}
      />
    );
  }

  const generateIdFromName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      id: currentView === 'add' ? generateIdFromName(name) : formData.id
    });
  };

  // Form View (Add/Edit)
  if (currentView === 'add' || currentView === 'edit') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors duration-200"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back</span>
                </button>
                <h1 className="text-2xl font-playfair font-semibold text-black">
                  {currentView === 'add' ? 'Add New Category' : 'Edit Category'}
                </h1>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSaveCategory}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Category ID *</label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="kebab-case-id"
                  disabled={currentView === 'edit'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {currentView === 'edit' 
                    ? 'Category ID cannot be changed after creation'
                    : 'Use kebab-case format (e.g., "hot-drinks", "cold-beverages")'
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Icon *</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter emoji or icon"
                  />
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                    {formData.icon}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use an emoji or icon character (e.g., ☕, 🧊, 🫖, 🥐)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Sort Order</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers appear first in the menu
                </p>
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-black">Active Category</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Dashboard</span>
              </button>
              <h1 className="text-2xl font-playfair font-semibold text-black">Manage Categories</h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setCurrentView('reorder')}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <ArrowUpDown className="h-4 w-4" />
                <span>Reorder</span>
              </button>
              <button
                onClick={handleAddCategory}
                className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                <Plus className="h-4 w-4" />
                <span>Add Category</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-playfair font-medium text-black mb-4">Categories</h2>
            
            {categories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No categories found</p>
                <button
                  onClick={handleAddCategory}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Add First Category
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 text-gray-400 cursor-move">
                        <GripVertical className="h-4 w-4" />
                        <span className="text-sm text-gray-500">#{category.sort_order}</span>
                      </div>
                      <div className="text-2xl">{category.icon}</div>
                      <div>
                        <h3 className="font-medium text-black">{category.name}</h3>
                        <p className="text-sm text-gray-500">ID: {category.id}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        category.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.active ? 'Active' : 'Inactive'}
                      </span>
                      
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && categoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6">
            <div className="flex items-start space-x-3 mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete Category: {categoryToDelete.name}
                </h3>
                
                {itemCount > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      This category contains <strong>{itemCount}</strong> menu item{itemCount !== 1 ? 's' : ''}. 
                      What would you like to do with {itemCount !== 1 ? 'them' : 'it'}?
                    </p>

                    <div className="space-y-3">
                      <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="deleteAction"
                          value="delete"
                          checked={deleteAction === 'delete'}
                          onChange={(e) => setDeleteAction(e.target.value as 'delete' | 'move')}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Delete all items</div>
                          <div className="text-sm text-gray-500">
                            Permanently delete the category and all {itemCount} menu item{itemCount !== 1 ? 's' : ''} in it
                          </div>
                        </div>
                      </label>

                      <label className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="deleteAction"
                          value="move"
                          checked={deleteAction === 'move'}
                          onChange={(e) => setDeleteAction(e.target.value as 'delete' | 'move')}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Move items to another category</div>
                          <div className="text-sm text-gray-500 mb-2">
                            Move all items to a different category before deleting
                          </div>
                          {deleteAction === 'move' && (
                            <select
                              value={moveToCategory}
                              onChange={(e) => setMoveToCategory(e.target.value)}
                              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              {categories
                                .filter(c => c.id !== categoryToDelete.id)
                                .map(cat => (
                                  <option key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.name}
                                  </option>
                                ))}
                            </select>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    This category is empty. Are you sure you want to delete it?
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCategory}
                disabled={isDeleting || (deleteAction === 'move' && !moveToCategory)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : `Delete Category ${deleteAction === 'delete' && itemCount > 0 ? `& ${itemCount} Item${itemCount !== 1 ? 's' : ''}` : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;