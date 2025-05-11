# Priority-based Print Queue API

This service provides a REST API for printing PDF files with configurable settings and priority levels.

## Features

- Submit PDF documents for printing with custom configuration
- Priority-based print queue (0-100, higher number = higher priority)
- Check job status
- Cancel pending print jobs
- Support for various print options (copies, duplex, page ranges, etc.)

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```
   
For development with auto-restart:
```
npm run dev
```

## API Endpoints

### Submit a Print Job

**POST /api/print**

Submit a PDF file and configuration for printing.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `pdf`: PDF file to print
  - `config`: JSON string with print configuration

**Example config:**
```json
{
  "printer": "HP-LaserJet-2200",
  "copies": 2,
  "duplex": true,
  "pages_per_sheet": 2,
  "orientation": "landscape",
  "paper_size": "A4",
  "color_mode": "monochrome",
  "page_ranges": "1-3,5,7-9",
  "priority": 75
}
```

**Response:**
```json
{
  "message": "Print job added to queue",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "priority": 75
}
```

### Get Job Status

**GET /api/print/:jobId**

Retrieve the status of a specific print job.

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "priority": 75,
  "status": "queued",
  "addedAt": "2023-06-15T10:30:00.000Z"
}
```

### Cancel a Job

**DELETE /api/print/:jobId**

Cancel a pending print job.

**Response:**
```json
{
  "message": "Print job cancelled successfully"
}
```

## Configuration Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| printer | string | Name of the printer to use | System default |
| copies | number | Number of copies to print | 1 |
| duplex | boolean | Print on both sides of paper | false |
| pages_per_sheet | number | Number of pages per sheet (1, 2, 4, or 6) | 1 |
| orientation | string | Page orientation ("portrait" or "landscape") | "portrait" |
| paper_size | string | Paper size (e.g., "A4", "Letter") | "A4" |
| border | string | Border style ("none" or default with border) | Single line border |
| color_mode | string | Color mode ("monochrome", "bi-level", or "color") | System default |
| page_ranges | string | Pages to print (e.g., "1-4,6,8-10") | All pages |
| priority | number | Job priority (0-100, higher = more priority) | 50 |

## Notes

The utility uses the CUPS printing system via the `unix-print` library, ensuring compatibility with Linux systems. 