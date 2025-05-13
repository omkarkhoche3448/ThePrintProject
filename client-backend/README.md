# ThePrintProject - Server

## Overview

ThePrintProject is a platform that connects users with local print shops. It allows users to upload documents to be printed, configure print settings, and place orders with nearby shopkeepers. The system handles the entire workflow from order creation to pickup or delivery.

## System Architecture

The system consists of the following main components:

- **Backend Server**: Node.js and Express server handling API requests
- **Database**: MongoDB with Mongoose ODM for data storage
- **File Storage**: GridFS for storing uploaded PDF files
- **Real-time Updates**: WebSocket service for real-time notifications and updates
- **Payment Integration**: Razorpay integration for online payments

## Key Features

- User authentication and management
- Shopkeeper management and dashboard
- File upload and storage
- Print job configuration and ordering
- Real-time order status updates via WebSockets
- Payment processing
- Delivery or pickup options

## Data Models

### PrintJob

The core model that represents a print job with multiple files:

```javascript
{
  jobId: "JOB-1714408621019-1234", // Unique job identifier
  orderId: "ORDER-1714408621019-5678", // Customer-facing order ID
  userId: "user_2MmGQDBxyz123", // User ID (string, can be from auth system)
  username: "John Doe", // User's display name
  shopkeeperId: ObjectId("6451f61b8b35f734c99b8d13"),
  files: [
    {
      filename: "document1.pdf",
      originalName: "resume.pdf",
      fileId: ObjectId("6451f6278b35f734c99b8d15"),
      uploadDate: "2023-05-03T05:23:51.019Z",
      printConfig: {
        copies: 2,
        colorMode: "blackAndWhite",
        pageSize: "A4",
        orientation: "portrait",
        duplexPrinting: true,
        pageRange: "all",
        pagesPerSheet: 1
      }
    },
    {
      filename: "document2.pdf",
      originalName: "invoice.pdf",
      fileId: ObjectId("6451f6278b35f734c99b8d16"),
      uploadDate: "2023-05-03T05:23:51.019Z",
      printConfig: {
        copies: 1,
        colorMode: "color",
        pageSize: "A4",
        orientation: "landscape",
        duplexPrinting: false,
        pageRange: "1-5",
        pagesPerSheet: 2
      }
    }
  ],
  status: "pending", // pending, processing, completed, cancelled, failed
  pricing: {
    baseCost: 50,
    discount: 0,
    taxAmount: 9,
    totalAmount: 59
  },
  payment: {
    status: "pending",
    razorpayOrderId: "order_MBsXXXXXXXX",
    method: "online"
  },
  timeline: {
    created: "2023-05-03T05:23:51.019Z",
    paid: null,
    processing: null,
    ready: null,
    completed: null
  },
  deliveryMethod: "pickup"
}
```

Key improvements in the new model:
- Single job/order contains multiple files
- Customer-friendly order ID displayed to users
- Username included along with user ID
- Each file has its own print configuration

- `jobId`: Unique identifier for the job
- `userId`: User who created the job
- `shopkeeperId`: Shopkeeper assigned to fulfill the job
- `file`: Details about the uploaded file
- `printConfig`: Print settings (color, size, orientation, etc.)
- `status`: Current job status (pending, processing, completed, cancelled, failed)
- `pricing`: Cost details
- `payment`: Payment details
- `timeline`: Timestamps for various job stages
- `deliveryMethod`: Pickup or delivery

### Shopkeeper

Represents a print service provider:

- `name`: Name of the shop
- `email` and `phoneNumber`: Contact details
- `address`: Location details
- `printCosts`: Pricing for different print options
- `discountRules`: Discount rules based on order volume
- `shopHours`: Operating hours
- `priorityRate`: Rate for priority service

### User

Represents an end user of the service:

- `name`: User's name
- `phoneNumber`: Primary contact
- `username`: Unique identifier
- `email`: Optional contact
- `address`: Delivery address
- `favoriteShops`: List of preferred shopkeepers

### Notification

System notifications for various events:

- `recipient`: User or shopkeeper
- `recipientId`: ID of the recipient
- `title` and `message`: Notification content
- `type`: Type of notification (order update, payment, system)
- `relatedTo`: Reference to related model and ID
- `read`: Read status

### Transaction

Financial transactions in the system:

- `userId` and `shopkeeperId`: Parties involved
- `printJobId`: Related print job
- `type`: Payment or refund
- `amount`: Transaction amount
- `paymentDetails`: Method and transaction identifiers
- `status`: Current transaction status

## API Endpoints

### Orders API

- `POST /orders/create`: Create a new print job order
- `GET /orders/user/:userId`: Get all orders for a specific user

### Shopkeeper Dashboard API

- `GET /shopkeeper-dashboard/:shopkeeperId/print-jobs`: Get print jobs for a shopkeeper with pagination
- `GET /shopkeeper-dashboard/print-jobs/:jobId`: Get details for a specific print job
- `PUT /shopkeeper-dashboard/print-jobs/:jobId/status`: Update status of a print job
- `GET /shopkeeper-dashboard/:shopkeeperId/job-stats`: Get job statistics for a shopkeeper

### Job Process API

- `PUT /job-process/:jobId/execute`: Change job status from 'pending' to 'processing'
- `GET /job-process/:shopkeeperId/by-status/:status`: Get all jobs with a specific status

### Shopkeepers API

- `GET /api/shopkeepers/:id`: Get shopkeeper details
- `GET /api/shopkeepers/:id/details`: Get extended shopkeeper details
- `GET /api/shopkeepers`: List all shopkeepers
- `POST /api/shopkeepers`: Create a new shopkeeper

## WebSocket Services

The system uses WebSockets for real-time updates with the following event types:

- `newPrintJob`: When a new print job is created
- `updatedPrintJob`: When a print job is updated
- `printJob_pending`, `printJob_processing`, `printJob_completed`, `printJob_cancelled`, `printJob_failed`: Status-specific events
- `ping`: Keep-alive message

## Setup and Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables in `.env`
4. Start the server: `node index.js`

## Development

### Environment Requirements

- Node.js v14+
- MongoDB v4.4+
- npm v6+

### Environment Variables

Create a `.env` file with:

```
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

## Testing

Run tests with:

```
npm test
```

## Security Considerations

- Authentication is handled via secure tokens
- Files are validated before storage
- Sensitive payment information is handled securely
- Input validation is performed on all endpoints
