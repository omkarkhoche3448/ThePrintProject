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

### API Reference for Development

The following endpoints are available at `http://localhost:3000` when running the server locally.

### Authentication API

#### Register a new user
- **URL**: `/auth/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "1234567890",
    "username": "johndoe123",
    "password": "securePassword123",
    "address": {
      "street": "123 Main St",
      "city": "Anytown",
      "state": "State",
      "zipCode": "12345",
      "country": "Country"
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "user": {
      "id": "user_2MmGQDBxyz123",
      "name": "John Doe",
      "email": "john@example.com",
      "username": "johndoe123"
    },
    "token": "jwt-token-here"
  }
  ```

#### Login user
- **URL**: `/auth/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "username": "johndoe123",
    "password": "securePassword123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "token": "jwt-token-here",
    "user": {
      "id": "user_2MmGQDBxyz123",
      "name": "John Doe",
      "email": "john@example.com",
      "username": "johndoe123"
    }
  }
  ```

### Orders API

#### Create a new print job order
- **URL**: `/orders/create`
- **Method**: `POST`
- **Authentication**: Required (JWT Token in Authorization header)
- **Request Body**:
  ```json
  {
    "shopkeeperId": "6451f61b8b35f734c99b8d13",
    "files": [
      {
        "originalName": "resume.pdf",
        "fileId": "6451f6278b35f734c99b8d15",
        "printConfig": {
          "copies": 2,
          "colorMode": "blackAndWhite",
          "pageSize": "A4",
          "orientation": "portrait",
          "duplexPrinting": true,
          "pageRange": "all",
          "pagesPerSheet": 1
        }
      },
      {
        "originalName": "invoice.pdf",
        "fileId": "6451f6278b35f734c99b8d16",
        "printConfig": {
          "copies": 1,
          "colorMode": "color",
          "pageSize": "A4",
          "orientation": "landscape",
          "duplexPrinting": false,
          "pageRange": "1-5",
          "pagesPerSheet": 2
        }
      }
    ],
    "deliveryMethod": "pickup"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Print job created successfully",
    "printJob": {
      "jobId": "JOB-1714408621019-1234",
      "orderId": "ORDER-1714408621019-5678",
      "status": "pending",
      "files": [
        {
          "filename": "document1.pdf",
          "originalName": "resume.pdf",
          "fileId": "6451f6278b35f734c99b8d15",
          "uploadDate": "2023-05-03T05:23:51.019Z",
          "printConfig": {
            "copies": 2,
            "colorMode": "blackAndWhite",
            "pageSize": "A4",
            "orientation": "portrait",
            "duplexPrinting": true,
            "pageRange": "all",
            "pagesPerSheet": 1
          }
        },
        {
          "filename": "document2.pdf",
          "originalName": "invoice.pdf",
          "fileId": "6451f6278b35f734c99b8d16",
          "uploadDate": "2023-05-03T05:23:51.019Z",
          "printConfig": {
            "copies": 1,
            "colorMode": "color",
            "pageSize": "A4",
            "orientation": "landscape",
            "duplexPrinting": false,
            "pageRange": "1-5",
            "pagesPerSheet": 2
          }
        }
      ],
      "pricing": {
        "baseCost": 50,
        "discount": 0,
        "taxAmount": 9,
        "totalAmount": 59
      },
      "payment": {
        "status": "pending",
        "razorpayOrderId": "order_MBsXXXXXXXX",
        "method": "online"
      }
    },
    "paymentInfo": {
      "razorpayOrderId": "order_MBsXXXXXXXX",
      "amount": 5900, // in paise
      "currency": "INR",
      "keyId": "rzp_test_xxxxxxxxxxxxx"
    }
  }
  ```

#### Get all orders for a specific user
- **URL**: `/orders/user/:userId`
- **Method**: `GET`
- **Authentication**: Required (JWT Token in Authorization header)
- **URL Parameters**: `userId=[string]`
- **Response**:
  ```json
  {
    "success": true,
    "orders": [
      {
        "jobId": "JOB-1714408621019-1234",
        "orderId": "ORDER-1714408621019-5678",
        "status": "pending",
        "shopkeeperName": "ABC Prints",
        "totalAmount": 59,
        "createdAt": "2023-05-03T05:23:51.019Z",
        "filesCount": 2
      },
      {
        "jobId": "JOB-1714408701234-5678",
        "orderId": "ORDER-1714408701234-9012",
        "status": "completed",
        "shopkeeperName": "XYZ Copy Center",
        "totalAmount": 45,
        "createdAt": "2023-05-02T10:15:01.234Z",
        "filesCount": 1
      }
    ]
  }
  ```

#### Get order details
- **URL**: `/orders/:jobId`
- **Method**: `GET`
- **Authentication**: Required (JWT Token in Authorization header)
- **URL Parameters**: `jobId=[string]`
- **Response**:
  ```json
  {
    "success": true,
    "order": {
      "jobId": "JOB-1714408621019-1234",
      "orderId": "ORDER-1714408621019-5678",
      "userId": "user_2MmGQDBxyz123",
      "username": "John Doe",
      "shopkeeperId": "6451f61b8b35f734c99b8d13",
      "shopkeeperName": "ABC Prints",
      "files": [
        {
          "filename": "document1.pdf",
          "originalName": "resume.pdf",
          "fileId": "6451f6278b35f734c99b8d15",
          "uploadDate": "2023-05-03T05:23:51.019Z",
          "printConfig": {
            "copies": 2,
            "colorMode": "blackAndWhite",
            "pageSize": "A4",
            "orientation": "portrait",
            "duplexPrinting": true,
            "pageRange": "all",
            "pagesPerSheet": 1
          }
        },
        {
          "filename": "document2.pdf",
          "originalName": "invoice.pdf",
          "fileId": "6451f6278b35f734c99b8d16",
          "uploadDate": "2023-05-03T05:23:51.019Z",
          "printConfig": {
            "copies": 1,
            "colorMode": "color",
            "pageSize": "A4",
            "orientation": "landscape",
            "duplexPrinting": false,
            "pageRange": "1-5",
            "pagesPerSheet": 2
          }
        }
      ],
      "status": "pending",
      "pricing": {
        "baseCost": 50,
        "discount": 0,
        "taxAmount": 9,
        "totalAmount": 59
      },
      "payment": {
        "status": "pending",
        "razorpayOrderId": "order_MBsXXXXXXXX",
        "method": "online"
      },
      "timeline": {
        "created": "2023-05-03T05:23:51.019Z",
        "paid": null,
        "processing": null,
        "ready": null,
        "completed": null
      },
      "deliveryMethod": "pickup"
    }
  }
  ```

### Shopkeeper Dashboard API

#### Get print jobs for a shopkeeper with pagination
- **URL**: `/shopkeeper-dashboard/:shopkeeperId/print-jobs`
- **Method**: `GET`
- **Authentication**: Required (JWT Token in Authorization header)
- **URL Parameters**: `shopkeeperId=[string]`
- **Query Parameters**:
  - `page=[integer]` (optional, default: 1)
  - `limit=[integer]` (optional, default: 10)
  - `status=[string]` (optional, filter by status)
- **Response**:
  ```json
  {
    "success": true,
    "printJobs": [
      {
        "jobId": "JOB-1714408621019-1234",
        "orderId": "ORDER-1714408621019-5678",
        "username": "John Doe",
        "status": "pending",
        "totalAmount": 59,
        "createdAt": "2023-05-03T05:23:51.019Z",
        "filesCount": 2,
        "deliveryMethod": "pickup"
      },
      {
        "jobId": "JOB-1714408701234-5678",
        "orderId": "ORDER-1714408701234-9012",
        "username": "Jane Smith",
        "status": "processing",
        "totalAmount": 45,
        "createdAt": "2023-05-02T10:15:01.234Z",
        "filesCount": 1,
        "deliveryMethod": "delivery"
      }
    ],
    "pagination": {
      "totalJobs": 45,
      "totalPages": 5,
      "currentPage": 1,
      "limit": 10
    }
  }
  ```

#### Get details for a specific print job
- **URL**: `/shopkeeper-dashboard/print-jobs/:jobId`
- **Method**: `GET`
- **Authentication**: Required (JWT Token in Authorization header)
- **URL Parameters**: `jobId=[string]`
- **Response**:
  ```json
  {
    "success": true,
    "printJob": {
      "jobId": "JOB-1714408621019-1234",
      "orderId": "ORDER-1714408621019-5678",
      "userId": "user_2MmGQDBxyz123",
      "username": "John Doe",
      "files": [
        {
          "filename": "document1.pdf",
          "originalName": "resume.pdf",
          "fileId": "6451f6278b35f734c99b8d15",
          "uploadDate": "2023-05-03T05:23:51.019Z",
          "printConfig": {
            "copies": 2,
            "colorMode": "blackAndWhite",
            "pageSize": "A4",
            "orientation": "portrait",
            "duplexPrinting": true,
            "pageRange": "all",
            "pagesPerSheet": 1
          }
        },
        {
          "filename": "document2.pdf",
          "originalName": "invoice.pdf",
          "fileId": "6451f6278b35f734c99b8d16",
          "uploadDate": "2023-05-03T05:23:51.019Z",
          "printConfig": {
            "copies": 1,
            "colorMode": "color",
            "pageSize": "A4",
            "orientation": "landscape",
            "duplexPrinting": false,
            "pageRange": "1-5",
            "pagesPerSheet": 2
          }
        }
      ],
      "status": "pending",
      "pricing": {
        "baseCost": 50,
        "discount": 0,
        "taxAmount": 9,
        "totalAmount": 59
      },
      "payment": {
        "status": "pending",
        "razorpayOrderId": "order_MBsXXXXXXXX",
        "method": "online"
      },
      "timeline": {
        "created": "2023-05-03T05:23:51.019Z",
        "paid": null,
        "processing": null,
        "ready": null,
        "completed": null
      },
      "deliveryMethod": "pickup",
      "userContact": {
        "phoneNumber": "1234567890",
        "email": "john@example.com"
      }
    }
  }
  ```

#### Update status of a print job
- **URL**: `/shopkeeper-dashboard/print-jobs/:jobId/status`
- **Method**: `PUT`
- **Authentication**: Required (JWT Token in Authorization header)
- **URL Parameters**: `jobId=[string]`
- **Request Body**:
  ```json
  {
    "status": "processing" // pending, processing, completed, cancelled, failed
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Print job status updated successfully",
    "printJob": {
      "jobId": "JOB-1714408621019-1234",
      "status": "processing",
      "timeline": {
        "created": "2023-05-03T05:23:51.019Z",
        "paid": "2023-05-03T06:30:00.000Z",
        "processing": "2023-05-03T08:45:12.345Z",
        "ready": null,
        "completed": null
      }
    }
  }
  ```

#### Get job statistics for a shopkeeper
- **URL**: `/shopkeeper-dashboard/:shopkeeperId/job-stats`
- **Method**: `GET`
- **Authentication**: Required (JWT Token in Authorization header)
- **URL Parameters**: `shopkeeperId=[string]`
- **Query Parameters**:
  - `timeframe=[string]` (optional, values: "day", "week", "month", default: "week")
- **Response**:
  ```json
  {
    "success": true,
    "stats": {
      "jobCounts": {
        "pending": 5,
        "processing": 3,
        "completed": 42,
        "cancelled": 1,
        "failed": 0,
        "total": 51
      },
      "revenue": {
        "daily": [
          { "date": "2023-05-01", "amount": 240 },
          { "date": "2023-05-02", "amount": 320 },
          { "date": "2023-05-03", "amount": 150 }
        ],
        "total": 710
      },
      "topPrintConfigurations": [
        { "config": "A4, Black & White, Double-sided", "count": 25 },
        { "config": "A4, Color, Single-sided", "count": 18 },
        { "config": "A3, Color, Single-sided", "count": 8 }
      ]
    }
  }
  ```

### Job Process API

#### Change job status from 'pending' to 'processing'
- **URL**: `/job-process/:jobId/execute`
- **Method**: `PUT`
- **Authentication**: Required (JWT Token in Authorization header)
- **URL Parameters**: `jobId=[string]`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Job status changed to processing",
    "printJob": {
      "jobId": "JOB-1714408621019-1234",
      "status": "processing",
      "timeline": {
        "created": "2023-05-03T05:23:51.019Z",
        "paid": "2023-05-03T06:30:00.000Z",
        "processing": "2023-05-03T08:45:12.345Z",
        "ready": null,
        "completed": null
      }
    }
  }
  ```

#### Get all jobs with a specific status
- **URL**: `/job-process/:shopkeeperId/by-status/:status`
- **Method**: `GET`
- **Authentication**: Required (JWT Token in Authorization header)
- **URL Parameters**:
  - `shopkeeperId=[string]`
  - `status=[string]` (pending, processing, completed, cancelled, failed)
- **Response**:
  ```json
  {
    "success": true,
    "printJobs": [
      {
        "jobId": "JOB-1714408621019-1234",
        "orderId": "ORDER-1714408621019-5678",
        "username": "John Doe",
        "status": "processing",
        "createdAt": "2023-05-03T05:23:51.019Z",
        "filesCount": 2,
        "files": [
          {
            "filename": "document1.pdf",
            "originalName": "resume.pdf"
          },
          {
            "filename": "document2.pdf",
            "originalName": "invoice.pdf"
          }
        ]
      },
      {
        "jobId": "JOB-1714408701234-5678",
        "orderId": "ORDER-1714408701234-9012",
        "username": "Jane Smith",
        "status": "processing",
        "createdAt": "2023-05-02T10:15:01.234Z", 
        "filesCount": 1,
        "files": [
          {
            "filename": "document3.pdf",
            "originalName": "report.pdf"
          }
        ]
      }
    ]
  }
  ```

### Shopkeepers API

#### Get shopkeeper details
- **URL**: `/api/shopkeepers/:id`
- **Method**: `GET`
- **URL Parameters**: `id=[string]`
- **Response**:
  ```json
  {
    "success": true,
    "shopkeeper": {
      "_id": "6451f61b8b35f734c99b8d13",
      "name": "ABC Prints",
      "email": "abc@prints.com",
      "phoneNumber": "9876543210",
      "address": {
        "street": "456 Shop Street",
        "city": "Printville",
        "state": "State",
        "zipCode": "54321",
        "country": "Country",
        "coordinates": {
          "latitude": 12.9716,
          "longitude": 77.5946
        }
      },
      "rating": 4.5,
      "reviewCount": 120
    }
  }
  ```

#### Get extended shopkeeper details
- **URL**: `/api/shopkeepers/:id/details`
- **Method**: `GET`
- **URL Parameters**: `id=[string]`
- **Response**:
  ```json
  {
    "success": true,
    "shopkeeper": {
      "_id": "6451f61b8b35f734c99b8d13",
      "name": "ABC Prints",
      "email": "abc@prints.com",
      "phoneNumber": "9876543210",
      "address": {
        "street": "456 Shop Street",
        "city": "Printville",
        "state": "State",
        "zipCode": "54321",
        "country": "Country",
        "coordinates": {
          "latitude": 12.9716,
          "longitude": 77.5946
        }
      },
      "shopHours": {
        "monday": { "open": "09:00", "close": "18:00" },
        "tuesday": { "open": "09:00", "close": "18:00" },
        "wednesday": { "open": "09:00", "close": "18:00" },
        "thursday": { "open": "09:00", "close": "18:00" },
        "friday": { "open": "09:00", "close": "18:00" },
        "saturday": { "open": "10:00", "close": "16:00" },
        "sunday": { "open": "closed", "close": "closed" }
      },
      "printCosts": {
        "blackAndWhite": {
          "A4": { "singleSided": 2, "doubleSided": 3 },
          "A3": { "singleSided": 4, "doubleSided": 6 }
        },
        "color": {
          "A4": { "singleSided": 10, "doubleSided": 18 },
          "A3": { "singleSided": 20, "doubleSided": 36 }
        }
      },
      "discountRules": [
        { "minCopies": 50, "discountPercentage": 5 },
        { "minCopies": 100, "discountPercentage": 10 },
        { "minCopies": 500, "discountPercentage": 15 }
      ],
      "priorityRate": 1.5,
      "rating": 4.5,
      "reviewCount": 120,
      "reviews": [
        {
          "userId": "user_3MmHQDBxyz456",
          "userName": "Jane Smith",
          "rating": 5,
          "comment": "Great service and fast printing!",
          "date": "2023-04-28T12:30:00.000Z"
        },
        {
          "userId": "user_4MmIQDBxyz789",
          "userName": "Mike Johnson",
          "rating": 4,
          "comment": "Good quality prints but slightly delayed delivery.",
          "date": "2023-04-25T15:45:00.000Z"
        }
      ]
    }
  }
  ```

#### List all shopkeepers
- **URL**: `/api/shopkeepers`
- **Method**: `GET`
- **Query Parameters**:
  - `page=[integer]` (optional, default: 1)
  - `limit=[integer]` (optional, default: 10)
  - `location=[string]` (optional, city name to filter by)
  - `rating=[number]` (optional, minimum rating to filter by)
- **Response**:
  ```json
  {
    "success": true,
    "shopkeepers": [
      {
        "_id": "6451f61b8b35f734c99b8d13",
        "name": "ABC Prints",
        "address": {
          "city": "Printville",
          "state": "State",
          "coordinates": {
            "latitude": 12.9716,
            "longitude": 77.5946
          }
        },
        "rating": 4.5,
        "reviewCount": 120
      },
      {
        "_id": "6451f61b8b35f734c99b8d14",
        "name": "XYZ Copy Center",
        "address": {
          "city": "Copytown",
          "state": "State",
          "coordinates": {
            "latitude": 12.9815,
            "longitude": 77.6094
          }
        },
        "rating": 4.2,
        "reviewCount": 85
      }
    ],
    "pagination": {
      "totalShopkeepers": 24,
      "totalPages": 3,
      "currentPage": 1,
      "limit": 10
    }
  }
  ```

#### Create a new shopkeeper
- **URL**: `/api/shopkeepers`
- **Method**: `POST`
- **Authentication**: Required (Admin JWT Token in Authorization header)
- **Request Body**:
  ```json
  {
    "name": "New Print Shop",
    "email": "newshop@example.com",
    "phoneNumber": "1122334455",
    "password": "secureShopPassword123",
    "address": {
      "street": "789 Print Avenue",
      "city": "Printopolis",
      "state": "State",
      "zipCode": "67890",
      "country": "Country",
      "coordinates": {
        "latitude": 12.9346,
        "longitude": 77.6245
      }
    },
    "shopHours": {
      "monday": { "open": "09:00", "close": "18:00" },
      "tuesday": { "open": "09:00", "close": "18:00" },
      "wednesday": { "open": "09:00", "close": "18:00" },
      "thursday": { "open": "09:00", "close": "18:00" },
      "friday": { "open": "09:00", "close": "18:00" },
      "saturday": { "open": "10:00", "close": "16:00" },
      "sunday": { "open": "closed", "close": "closed" }
    },
    "printCosts": {
      "blackAndWhite": {
        "A4": { "singleSided": 2, "doubleSided": 3 },
        "A3": { "singleSided": 4, "doubleSided": 6 }
      },
      "color": {
        "A4": { "singleSided": 10, "doubleSided": 18 },
        "A3": { "singleSided": 20, "doubleSided": 36 }
      }
    },
    "discountRules": [
      { "minCopies": 50, "discountPercentage": 5 },
      { "minCopies": 100, "discountPercentage": 10 },
      { "minCopies": 500, "discountPercentage": 15 }
    ],
    "priorityRate": 1.5
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Shopkeeper created successfully",
    "shopkeeper": {
      "_id": "6451f61b8b35f734c99b8d15",
      "name": "New Print Shop",
      "email": "newshop@example.com",
      "phoneNumber": "1122334455"
    }
  }
  ```

### File Upload API

#### Upload a PDF file
- **URL**: `/upload/pdf`
- **Method**: `POST`
- **Authentication**: Required (JWT Token in Authorization header)
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `file`: PDF file (required)
- **Response**:
  ```json
  {
    "success": true,
    "message": "File uploaded successfully",
    "fileInfo": {
      "fileId": "6451f6278b35f734c99b8d15",
      "filename": "document1.pdf",
      "originalName": "resume.pdf",
      "uploadDate": "2023-05-03T05:23:51.019Z",
      "size": 245678
    }
  }
  ```

### Payment API

#### Verify payment
- **URL**: `/payment/verify`
- **Method**: `POST`
- **Authentication**: Required (JWT Token in Authorization header)
- **Request Body**:
  ```json
  {
    "jobId": "JOB-1714408621019-1234",
    "paymentId": "pay_MBsYYYYYYYYY",
    "razorpayOrderId": "order_MBsXXXXXXXX",
    "signature": "signature_hash_value"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Payment verified successfully",
    "printJob": {
      "jobId": "JOB-1714408621019-1234",
      "orderId": "ORDER-1714408621019-5678",
      "status": "pending",
      "payment": {
        "status": "completed",
        "razorpayOrderId": "order_MBsXXXXXXXX",
        "paymentId": "pay_MBsYYYYYYYYY",
        "method": "online"
      },
      "timeline": {
        "created": "2023-05-03T05:23:51.019Z",
        "paid": "2023-05-03T06:30:00.000Z",
        "processing": null,
        "ready": null,
        "completed": null
      }
    }
  }
  ```

## WebSocket Services

The system uses WebSockets for real-time updates on port `http://localhost:3000/ws`. You can connect to this service using WebSocket client libraries.

### WebSocket Connection

- **URL**: `ws://localhost:3000/ws`
- **Authentication**: Required (Pass JWT token as a query parameter)
- **Connection URL Example**: `ws://localhost:3000/ws?token=jwt-token-here&type=user&id=user_2MmGQDBxyz123`
- **Query Parameters**:
  - `token`: JWT authentication token
  - `type`: Connection type ('user' or 'shopkeeper')
  - `id`: User ID or Shopkeeper ID

### WebSocket Events

The server emits the following event types:

#### Events sent from server to client

- `newPrintJob`: When a new print job is created
  ```json
  {
    "event": "newPrintJob",
    "data": {
      "jobId": "JOB-1714408621019-1234",
      "orderId": "ORDER-1714408621019-5678",
      "username": "John Doe",
      "shopkeeperId": "6451f61b8b35f734c99b8d13",
      "status": "pending",
      "createdAt": "2023-05-03T05:23:51.019Z",
      "filesCount": 2
    }
  }
  ```

- `updatedPrintJob`: When a print job is updated
  ```json
  {
    "event": "updatedPrintJob",
    "data": {
      "jobId": "JOB-1714408621019-1234",
      "orderId": "ORDER-1714408621019-5678",
      "status": "processing",
      "updatedAt": "2023-05-03T08:45:12.345Z"
    }
  }
  ```

- Status-specific events: Fired when a print job transitions to a specific status
  - `printJob_pending`
  - `printJob_processing`
  - `printJob_completed`
  - `printJob_cancelled`
  - `printJob_failed`
  
  Example payload:
  ```json
  {
    "event": "printJob_processing",
    "data": {
      "jobId": "JOB-1714408621019-1234",
      "orderId": "ORDER-1714408621019-5678",
      "oldStatus": "pending",
      "newStatus": "processing",
      "timestamp": "2023-05-03T08:45:12.345Z"
    }
  }
  ```

- `notification`: When a new notification is created
  ```json
  {
    "event": "notification",
    "data": {
      "id": "6451f61b8b35f734c99b8d20",
      "recipientId": "user_2MmGQDBxyz123",
      "title": "Order Status Update",
      "message": "Your order ORDER-1714408621019-5678 is now processing",
      "type": "order_update",
      "relatedTo": {
        "model": "PrintJob", 
        "id": "JOB-1714408621019-1234"
      },
      "read": false,
      "createdAt": "2023-05-03T08:45:12.345Z"
    }
  }
  ```

- `ping`: Keep-alive message sent every 30 seconds
  ```json
  {
    "event": "ping",
    "data": {
      "timestamp": "2023-05-03T08:45:12.345Z"
    }
  }
  ```

#### Events sent from client to server

- `pong`: Response to a ping message
  ```json
  {
    "event": "pong",
    "data": {
      "timestamp": "2023-05-03T08:45:12.345Z"
    }
  }
  ```

- `subscribe`: Subscribe to specific events
  ```json
  {
    "event": "subscribe",
    "data": {
      "channel": "printJob",
      "filters": {
        "jobId": "JOB-1714408621019-1234"
      }
    }
  }
  ```

- `unsubscribe`: Unsubscribe from specific events
  ```json
  {
    "event": "unsubscribe",
    "data": {
      "channel": "printJob",
      "filters": {
        "jobId": "JOB-1714408621019-1234"
      }
    }
  }
  ```

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

Create a `.env` file with the following variables:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
DB_NAME=thePrintProject

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxx

# File Upload Settings
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=application/pdf

# WebSocket Configuration
WS_PING_INTERVAL=30000  # 30 seconds
```

## Error Responses

All API endpoints return standardized error responses with the following structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional error details
  }
}
```

### Common Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `AUTH_REQUIRED` | 401 | Authentication is required |
| `INVALID_CREDENTIALS` | 401 | Invalid username or password |
| `UNAUTHORIZED` | 403 | User does not have permission |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource not found |
| `VALIDATION_ERROR` | 422 | Request data validation failed |
| `PAYMENT_FAILED` | 400 | Payment verification failed |
| `FILE_UPLOAD_ERROR` | 400 | File upload error |
| `SERVER_ERROR` | 500 | Internal server error |

### Validation Error Example

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": "Valid email address is required",
      "password": "Password must be at least 8 characters"
    }
  }
}
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
