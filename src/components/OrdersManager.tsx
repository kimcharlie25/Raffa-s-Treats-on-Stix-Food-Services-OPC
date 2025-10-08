import React, { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle, Clock, XCircle, RefreshCw, ChevronDown, Search, Image as ImageIcon, Download, Calendar } from 'lucide-react';
import { useOrders, OrderWithItems } from '../hooks/useOrders';

interface OrdersManagerProps {
  onBack: () => void;
}

const OrdersManager: React.FC<OrdersManagerProps> = ({ onBack }) => {
  const { orders, loading, error, updateOrderStatus } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'>('all');
  const [sortKey, setSortKey] = useState<'created_at' | 'total' | 'customer_name' | 'status'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [exporting, setExporting] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'preparing':
        return <RefreshCw className="h-4 w-4" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(orderId);
      await updateOrderStatus(orderId, newStatus);
    } catch (err) {
      alert('Failed to update order status');
    } finally {
      setUpdating(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatServiceType = (serviceType: string) => {
    return serviceType.charAt(0).toUpperCase() + serviceType.slice(1).replace('-', ' ');
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = statusFilter === 'all' ? orders : orders.filter(o => o.status.toLowerCase() === statusFilter);
    
    // Apply date filters
    let dateFiltered = base;
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      dateFiltered = dateFiltered.filter(o => new Date(o.created_at) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      dateFiltered = dateFiltered.filter(o => new Date(o.created_at) <= toDate);
    }
    
    const searched = q.length === 0
      ? dateFiltered
      : dateFiltered.filter(o =>
          o.customer_name.toLowerCase().includes(q) ||
          o.contact_number.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q) ||
          (o.address || '').toLowerCase().includes(q)
        );
    const sorted = [...searched].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortKey) {
        case 'total':
          return (a.total - b.total) * dir;
        case 'customer_name':
          return a.customer_name.localeCompare(b.customer_name) * dir;
        case 'status':
          return a.status.localeCompare(b.status) * dir;
        case 'created_at':
        default:
          return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
      }
    });
    return sorted;
  }, [orders, query, statusFilter, sortKey, sortDir, dateFrom, dateTo]);

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'created_at' ? 'desc' : 'asc');
    }
  };

  const exportToCSV = () => {
    setExporting(true);
    try {
      // Filter completed orders only
      const completedOrders = filtered.filter(o => o.status.toLowerCase() === 'completed');
      
      if (completedOrders.length === 0) {
        alert('No completed orders to export.');
        setExporting(false);
        return;
      }

      // CSV Headers
      const headers = [
        'Order ID',
        'Date',
        'Customer Name',
        'Contact Number',
        'Service Type',
        'Address',
        'Payment Method',
        'Items',
        'Total',
        'Status',
        'Notes'
      ];

      // CSV Rows
      const rows = completedOrders.map(order => {
        const itemsList = order.order_items.map(item => {
          let itemStr = `${item.name} x${item.quantity}`;
          if (item.variation) {
            itemStr += ` (${item.variation.name})`;
          }
          if (item.add_ons && item.add_ons.length > 0) {
            const addOnsStr = item.add_ons.map((a: any) => 
              a.quantity > 1 ? `${a.name} x${a.quantity}` : a.name
            ).join(', ');
            itemStr += ` + ${addOnsStr}`;
          }
          return itemStr;
        }).join('; ');

        return [
          order.id.slice(-8).toUpperCase(),
          formatDateTime(order.created_at),
          order.customer_name,
          order.contact_number,
          formatServiceType(order.service_type),
          order.address || 'N/A',
          order.payment_method,
          `"${itemsList}"`, // Wrap in quotes to handle commas
          order.total.toFixed(2),
          order.status,
          `"${order.notes || 'N/A'}"` // Wrap in quotes
        ];
      });

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute('href', url);
      link.setAttribute('download', `completed_orders_${dateStr}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(`Successfully exported ${completedOrders.length} completed order(s)!`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export orders. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const clearDateFilters = () => {
    setDateFrom('');
    setDateTo('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Orders</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onBack}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
                <span>Back to Dashboard</span>
              </button>
              <h1 className="text-2xl font-playfair font-semibold text-black">Orders Management</h1>
            </div>
            <div className="text-sm text-gray-500">
              {orders.length} order{orders.length !== 1 ? 's' : ''} total
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-200">
          <div className="flex flex-col gap-4">
            {/* Search and Status Row */}
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="flex-1 relative">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search orders by name, phone, ID, address"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSort('created_at')}
                    className={`px-3 py-2 rounded-lg border text-sm flex items-center gap-1 ${sortKey==='created_at' ? 'border-blue-500 text-blue-700 bg-blue-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    Date
                    <ChevronDown className={`h-4 w-4 transition-transform ${sortKey==='created_at' && sortDir==='asc' ? 'rotate-180' : ''}`} />
                  </button>
                  <button
                    onClick={() => toggleSort('total')}
                    className={`px-3 py-2 rounded-lg border text-sm flex items-center gap-1 ${sortKey==='total' ? 'border-blue-500 text-blue-700 bg-blue-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    Total
                    <ChevronDown className={`h-4 w-4 transition-transform ${sortKey==='total' && sortDir==='asc' ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Date Filter and Export Row */}
            <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between border-t border-gray-200 pt-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Date Range:</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="From"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="To"
                  />
                  {(dateFrom || dateTo) && (
                    <button
                      onClick={clearDateFilters}
                      className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              
              <button
                onClick={exportToCSV}
                disabled={exporting || filtered.filter(o => o.status.toLowerCase() === 'completed').length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
              >
                <Download className="h-4 w-4" />
                {exporting ? 'Exporting...' : 'Export Completed Orders'}
              </button>
            </div>

            {/* Results count */}
            {(dateFrom || dateTo) && (
              <div className="text-sm text-gray-600">
                Showing {filtered.length} order{filtered.length !== 1 ? 's' : ''} 
                {dateFrom && ` from ${new Date(dateFrom).toLocaleDateString()}`}
                {dateTo && ` to ${new Date(dateTo).toLocaleDateString()}`}
              </div>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600">Orders will appear here when customers place them.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 sticky top-0">
                    <tr>
                      <th className="px-5 py-3 text-left font-medium">Order</th>
                      <th className="px-5 py-3 text-left font-medium">Customer</th>
                      <th className="px-5 py-3 text-left font-medium">Service</th>
                      <th className="px-5 py-3 text-left font-medium">Total</th>
                      <th className="px-5 py-3 text-left font-medium">Status</th>
                      <th className="px-5 py-3 text-left font-medium">Placed</th>
                      <th className="px-5 py-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filtered.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <div className="font-medium text-gray-900">#{order.id.slice(-8).toUpperCase()}</div>
                          <div className="text-xs text-gray-500">{order.order_items.length} item(s)</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-medium text-gray-900">{order.customer_name}</div>
                          <div className="text-xs text-gray-500">{order.contact_number}</div>
                        </td>
                        <td className="px-5 py-4 text-gray-700">{formatServiceType(order.service_type)}</td>
                        <td className="px-5 py-4 font-semibold text-gray-900">₱{order.total.toFixed(2)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status}</span>
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-700">{formatDateTime(order.created_at)}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700"
                            >
                              View
                            </button>
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                              disabled={updating === order.id}
                              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="preparing">Preparing</option>
                              <option value="ready">Ready</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            {updating === order.id && (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {filtered.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-900">#{order.id.slice(-8).toUpperCase()}</div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 mb-2">
                      <div className="font-medium">{order.customer_name}</div>
                      <div className="text-gray-500">{order.contact_number}</div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-gray-600">{formatServiceType(order.service_type)}</div>
                      <div className="font-semibold text-gray-900">₱{order.total.toFixed(2)}</div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{formatDateTime(order.created_at)}</div>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100"
                      >
                        Details
                      </button>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        disabled={updating === order.id}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Order #{selectedOrder.id.slice(-8).toUpperCase()}
                </h3>
                <p className="text-sm text-gray-500 mt-1">Complete order details</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <XCircle className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
                    <p><strong>Contact:</strong> {selectedOrder.contact_number}</p>
                    <p><strong>Service Type:</strong> {formatServiceType(selectedOrder.service_type)}</p>
                    <p><strong>Payment Method:</strong> {selectedOrder.payment_method}</p>
                    <p><strong>Order Date:</strong> {formatDateTime(selectedOrder.created_at)}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Order Details</h4>
                  <div className="space-y-2 text-sm">
                    {selectedOrder.address && <p><strong>Address:</strong> {selectedOrder.address}</p>}
                    {selectedOrder.pickup_time && <p><strong>Pickup Time:</strong> {selectedOrder.pickup_time}</p>}
                    {selectedOrder.party_size && <p><strong>Party Size:</strong> {selectedOrder.party_size} person{selectedOrder.party_size !== 1 ? 's' : ''}</p>}
                    {selectedOrder.dine_in_time && <p><strong>Dine-in Time:</strong> {formatDateTime(selectedOrder.dine_in_time)}</p>}
                    {selectedOrder.notes && <p><strong>Notes:</strong> {selectedOrder.notes}</p>}
                    <p><strong>Total:</strong> ₱{selectedOrder.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Payment Receipt */}
              {selectedOrder.receipt_url && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2" />
                    Payment Receipt
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <a
                      href={selectedOrder.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <img
                        src={selectedOrder.receipt_url}
                        alt="Payment Receipt"
                        className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-300 group-hover:border-blue-500 transition-colors cursor-pointer"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImage not available%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <p className="text-center text-sm text-blue-600 group-hover:text-blue-700 mt-2">
                        Click to view full size
                      </p>
                    </a>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.order_items.map((item) => (
                    <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{item.name}</div>
                          {item.variation && (
                            <div className="text-sm text-gray-600 mt-1">Size: {item.variation.name}</div>
                          )}
                          {item.add_ons && item.add_ons.length > 0 && (
                            <div className="text-sm text-gray-600 mt-1">
                              Add-ons: {item.add_ons.map((addon: any) => 
                                addon.quantity > 1 ? `${addon.name} x${addon.quantity}` : addon.name
                              ).join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">₱{item.unit_price.toFixed(2)} x {item.quantity}</div>
                          <div className="text-sm text-gray-600">₱{item.subtotal.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManager;
