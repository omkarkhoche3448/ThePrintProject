import React, { useState, useEffect } from 'react';
import OrderList from './OrderList';
import PrintQueue from './PrintQueue';
import PrinterStatus from './PrinterStatus';
import Notification from './Notification';

const Dashboard = ({ onLogout }) => {
  const [orders, setOrders] = useState([]);
  const [queue, setQueue] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [notification, setNotification] = useState(null);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const ordersData = await window.api.getOrders();
        const queueData = await window.api.getQueue();
        const printersData = await window.api.getPrinters();
        
        setOrders(ordersData);
        setQueue(queueData);
        setPrinters(printersData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
    
    // Set up listener for printer status changes
    const cleanup = window.api.onPrinterAvailable((printerId) => {
      setPrinters(prevPrinters => 
        prevPrinters.map(printer => 
          printer.id === printerId 
            ? { ...printer, status: 'available', currentJob: null } 
            : printer
        )
      );
      setNotification({
        type: 'success',
        message: `Printer ${printerId} is now available`
      });
    });
    
    return cleanup;
  }, []);

  // Function to add an order to the queue
  const addToQueue = (order) => {
    const updatedQueue = [...queue, { ...order, status: 'pending' }];
    setQueue(updatedQueue);
    window.api.updateQueue(updatedQueue);
    setNotification({
      type: 'success',
      message: `Order #${order.id} added to queue`
    });
  };

  // Function to assign a print job to a printer
  const assignToPrinter = async (jobIndex, printerId) => {
    const job = queue[jobIndex];
    
    // Update printer status
    const updatedPrinters = printers.map(printer => 
      printer.id === printerId 
        ? { ...printer, status: 'busy', currentJob: job.id } 
        : printer
    );
    setPrinters(updatedPrinters);
    
    // Update job status and remove from queue
    const updatedQueue = [...queue];
    updatedQueue.splice(jobIndex, 1);
    setQueue(updatedQueue);
    
    // Persist changes
    await window.api.updatePrinterStatus({ printerId, status: 'busy', jobId: job.id });
    await window.api.updateQueue(updatedQueue);
    
    setNotification({
      type: 'info',
      message: `Job #${job.id} assigned to Printer ${printerId}`
    });
  };

  // Function to handle queue reordering
  const updateQueueOrder = async (newQueue) => {
    setQueue(newQueue);
    await window.api.updateQueue(newQueue);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Xerox Shop Dashboard</h1>
        <button className="logout-button" onClick={onLogout}>Logout</button>
      </header>
      
      <div className="dashboard-content">
        <section className="section order-section">
          <h2>Incoming Orders</h2>
          <OrderList orders={orders} onAddToQueue={addToQueue} />
        </section>
        
        <section className="section queue-section">
          <h2>Print Queue</h2>
          <PrintQueue 
            queue={queue} 
            updateQueue={updateQueueOrder} 
          />
        </section>
        
        <section className="section printer-section">
          <h2>Printers</h2>
          <PrinterStatus 
            printers={printers} 
            queue={queue}
            onAssignJob={assignToPrinter} 
          />
        </section>
      </div>
      
      {notification && (
        <Notification 
          type={notification.type} 
          message={notification.message} 
          onClose={() => setNotification(null)} 
        />
      )}
    </div>
  );
};

export default Dashboard;