import React from 'react';
import { useParams } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';

const ReceiptPrint: React.FC = () => {
  const { orderId } = useParams();
  const { orders, loading, fetchOrders } = useOrders();

  React.useEffect(() => {
    if (!orders || orders.length === 0) {
      fetchOrders();
    }
    // Small delay to allow render before auto-print on first load
    const timer = setTimeout(() => {
      // Only auto-print when opened directly on this page
      if (typeof window !== 'undefined') {
        window.print();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const order = React.useMemo(() => orders.find(o => o.id === orderId), [orders, orderId]);

  if (loading && !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Order not found</div>
      </div>
    );
  }

  const created = new Date(order.created_at);

  return (
    <div className="receipt mx-auto">
      <div className="text-center">
        <div className="font-bold text-base">Raffa's Treats on Stix Food Services OPC</div>
        <div>Order Slip</div>
        <div>{created.toLocaleString()}</div>
      </div>

      <div className="divider" />

      <div>
        <div><strong>Order:</strong> #{order.id.slice(-8).toUpperCase()}</div>
        <div><strong>Name:</strong> {order.customer_name}</div>
        <div><strong>Phone:</strong> {order.contact_number}</div>
        <div><strong>Service:</strong> {order.service_type}</div>
        {order.address && <div><strong>Addr:</strong> {order.address}</div>}
        {order.pickup_time && <div><strong>Pickup:</strong> {order.pickup_time}</div>}
        {order.party_size && <div><strong>Party:</strong> {order.party_size}</div>}
        {order.dine_in_time && <div><strong>Dine-in:</strong> {new Date(order.dine_in_time).toLocaleString()}</div>}
      </div>

      <div className="divider" />

      <div>
        {order.order_items.map((item) => (
          <div key={item.id}>
            <div className="totals-row">
              <div>
                {item.name}
                {item.variation ? ` (${item.variation.name})` : ''}
                {item.add_ons && item.add_ons.length > 0 ? ` + ${item.add_ons.map((a: any) => a.quantity > 1 ? `${a.name} x${a.quantity}` : a.name).join(', ')}` : ''}
                {' '}
                x{item.quantity}
              </div>
              <div>₱{item.subtotal.toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="divider" />

      <div className="totals-row">
        <div><strong>Total</strong></div>
        <div><strong>₱{order.total.toFixed(2)}</strong></div>
      </div>

      {order.notes && (
        <>
          <div className="divider" />
          <div><strong>Notes:</strong> {order.notes}</div>
        </>
      )}

      <div className="divider" />
      <div className="text-center">Thank you!</div>
    </div>
  );
};

export default ReceiptPrint;


