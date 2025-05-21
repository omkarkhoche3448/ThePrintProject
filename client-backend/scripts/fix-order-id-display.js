// fix-order-id-display.js
const fs = require('fs');
const path = require('path');

// Path to OrdersPage.tsx
const orderPagePath = path.join(__dirname, '..', '..', 'client-frontend', 'src', 'pages', 'OrdersPage.tsx');

// Read the current file content
fs.readFile(orderPagePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading OrdersPage.tsx:', err);
    return;
  }

  // Update order ID display format in card list
  let updatedContent = data.replace(
    /<h3 className="font-medium text-lg mb-1">\s*{firstOrder\.orderId \? `Order #\${firstOrder\.orderId}` : `Order #\${firstOrder\._id\.substring\(firstOrder\._id\.length - 6\)}`}\s*<\/h3>/g,
    '<h3 className="font-medium text-lg mb-1">Order #{firstOrder.orderId}</h3>'
  );

  // Update order ID display format in order details
  updatedContent = updatedContent.replace(
    /<h2 className="text-2xl font-medium mb-1">\s*{formatOrderId\(order\.orderId\)}\s*<\/h2>/g,
    '<h2 className="text-2xl font-medium mb-1">Order #{order.orderId}</h2>'
  );

  // Create a formatOrderId function if it doesn't exist
  if (!updatedContent.includes('const formatOrderId')) {
    const orderPageComponent = 'const OrdersPage: React.FC = () => {';
    const formatOrderIdFunction = `const OrdersPage: React.FC = () => {
  // Format order ID to a user-friendly display format
  const formatOrderId = (orderId: string | undefined): string => {
    // If orderId is undefined or null, return a placeholder
    if (!orderId) return 'Order #------';
    
    // Return the orderId with the prefix
    return \`Order #\${orderId}\`;
  };

  // Theme state with localStorage`;

    updatedContent = updatedContent.replace(orderPageComponent, formatOrderIdFunction);
  }

  // Save the updated file
  fs.writeFile(orderPagePath, updatedContent, 'utf8', (writeErr) => {
    if (writeErr) {
      console.error('Error writing OrdersPage.tsx:', writeErr);
      return;
    }
    console.log('Successfully updated OrdersPage.tsx with consistent order ID formatting');
  });
});
