import React from 'react';

const OrderList = ({ orders, onAddToQueue }) => {
  // Function to format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  return (
    <div className="order-list">
      {orders.length === 0 ? (
        <div className="no-orders">No pending orders</div>
      ) : (
        <ul>
          {orders.map(order => (
            <li key={order.id} className="order-item">
              <div className="order-header">
                <span className="order-id">Order #{order.id}</span>
                <span className="order-time">{formatTime(order.timestamp)}</span>
              </div>
              <div className="order-details">
                <div><strong>File:</strong> {order.fileName}</div>
                <div><strong>Pages:</strong> {order.pageCount}</div>
                <div><strong>Type:</strong> {order.colorMode}</div>
              </div>
              <button 
                className="add-to-queue-btn"
                onClick={() => onAddToQueue(order)}
              >
                Add to Queue
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrderList;