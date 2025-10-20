import React, { useMemo, useState } from 'react';
import { ArrowLeft, AlertTriangle, Minus, Plus, RefreshCw, ArrowUp, ArrowDown } from 'lucide-react';
import { MenuItem } from '../types';

type InventoryManagerProps = {
  items: MenuItem[];
  onBack: () => void;
  onUpdateItem: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  loading: boolean;
};

type SortOrder = 'asc' | 'desc' | 'none';

const InventoryManager: React.FC<InventoryManagerProps> = ({ items, onBack, onUpdateItem, loading }) => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');

  const filteredAndSortedItems = useMemo(() => {
    // First, filter by search query
    const term = query.trim().toLowerCase();
    let filtered = term 
      ? items.filter((item) =>
          item.name.toLowerCase().includes(term) ||
          item.category.toLowerCase().includes(term)
        )
      : [...items];

    // Then, sort alphabetically if sorting is enabled
    if (sortOrder !== 'none') {
      filtered.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        
        if (sortOrder === 'asc') {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });
    }

    return filtered;
  }, [items, query, sortOrder]);

  const toggleSort = () => {
    setSortOrder((current) => {
      if (current === 'none') return 'asc';
      if (current === 'asc') return 'desc';
      return 'none';
    });
  };

  const adjustStock = async (item: MenuItem, delta: number) => {
    if (!item.trackInventory) return;
    const current = item.stockQuantity ?? 0;
    const next = Math.max(0, current + delta);
    setProcessingId(item.id);
    try {
      await onUpdateItem(item.id, {
        trackInventory: true,
        stockQuantity: next,
      });
    } catch (error) {
      console.error('Failed to adjust stock', error);
      alert('Failed to adjust stock. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const updateStock = async (item: MenuItem, rawValue: string) => {
    if (!item.trackInventory) return;
    const numeric = Math.max(0, Math.floor(Number(rawValue)) || 0);
    setProcessingId(item.id);
    try {
      await onUpdateItem(item.id, {
        trackInventory: true,
        stockQuantity: numeric,
      });
    } catch (error) {
      console.error('Failed to update stock value', error);
      alert('Failed to update stock value. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const updateThreshold = async (item: MenuItem, rawValue: string) => {
    if (!item.trackInventory) return;
    const numeric = Math.max(0, Math.floor(Number(rawValue)) || 0);
    setProcessingId(item.id);
    try {
      await onUpdateItem(item.id, {
        trackInventory: true,
        lowStockThreshold: numeric,
      });
    } catch (error) {
      console.error('Failed to update threshold', error);
      alert('Failed to update threshold. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const toggleTracking = async (item: MenuItem, track: boolean) => {
    setProcessingId(item.id);
    try {
      await onUpdateItem(item.id, {
        trackInventory: track,
        stockQuantity: track ? Math.max(0, Math.floor(Number(item.stockQuantity ?? 0))) : null,
        lowStockThreshold: track ? Math.max(0, Math.floor(Number(item.lowStockThreshold ?? 0))) : 0,
        available: track
          ? (item.stockQuantity ?? 0) > (item.lowStockThreshold ?? 0)
          : item.available,
      });
    } catch (error) {
      console.error('Failed to toggle inventory tracking', error);
      alert('Failed to update inventory tracking. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const isProcessing = (id: string) => processingId === id;

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
                <span>Dashboard</span>
              </button>
              <h1 className="text-2xl font-playfair font-semibold text-black">Inventory Management</h1>
            </div>
            <div className="text-sm text-gray-500">
              {filteredAndSortedItems.length} item{filteredAndSortedItems.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex-1">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search menu items or categories"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="text-sm text-gray-500">
              Track inventory to automatically disable low-stock items.
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                    onClick={toggleSort}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Product Name</span>
                      <div className="flex flex-col">
                        {sortOrder === 'none' && (
                          <div className="text-gray-400">
                            <ArrowUp className="h-3 w-3 -mb-1" />
                            <ArrowDown className="h-3 w-3" />
                          </div>
                        )}
                        {sortOrder === 'asc' && (
                          <ArrowUp className="h-4 w-4 text-green-600" />
                        )}
                        {sortOrder === 'desc' && (
                          <ArrowDown className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threshold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedItems.map((item) => {
                  const tracking = item.trackInventory ?? false;
                  const stock = tracking ? item.stockQuantity ?? 0 : null;
                  const threshold = tracking ? item.lowStockThreshold ?? 0 : null;
                  const low = tracking && stock !== null && threshold !== null && stock <= threshold;
                  return (
                    <tr key={item.id} className={low ? 'bg-red-50/40' : undefined}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{item.name}</span>
                          <span className="text-xs text-gray-500">{item.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <label className="inline-flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={tracking}
                            onChange={(e) => toggleTracking(item, e.target.checked)}
                            disabled={isProcessing(item.id)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-sm text-gray-600">{tracking ? 'Enabled' : 'Disabled'}</span>
                        </label>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tracking ? (
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => adjustStock(item, -1)}
                              disabled={isProcessing(item.id) || !tracking || stock === null || stock === 0}
                              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <input
                              type="number"
                              min={0}
                              defaultValue={stock ?? 0}
                              onBlur={(e) => updateStock(item, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.currentTarget.blur();
                                }
                              }}
                              disabled={isProcessing(item.id)}
                              className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => adjustStock(item, 1)}
                              disabled={isProcessing(item.id) || !tracking}
                              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Tracking disabled</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tracking ? (
                          <input
                            type="number"
                            min={0}
                            defaultValue={threshold ?? 0}
                            onBlur={(e) => updateThreshold(item, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.currentTarget.blur();
                              }
                            }}
                            disabled={isProcessing(item.id)}
                            className="w-24 px-2 py-1.5 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {tracking ? (
                            low ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Low stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                In stock
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              Not tracking
                            </span>
                          )}
                          {item.autoDisabled && (
                            <span className="inline-flex items-center space-x-1 text-xs text-red-600">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              <span>Disabled</span>
                            </span>
                          )}
                          {isProcessing(item.id) && <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!filteredAndSortedItems.length && !loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      No menu items found. Try adjusting your search.
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      Loading inventory...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManager;
