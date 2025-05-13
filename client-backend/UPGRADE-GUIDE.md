# Print Project Updates - Job Structure Redesign

## Overview of Changes

We've redesigned the print job structure to keep multiple files under a single job/order ID, instead of creating a new job for each file. This improves organization and aligns with how orders are displayed to users.

## Key Changes Made

1. **PrintJob Schema Changes**:
   - Added `orderId` field that will be displayed to users
   - Changed `file` to `files` array to store multiple files
   - Added `username` field to store the user's name
   - Each file in the array has its own print configuration

2. **Order Processing Updates**:
   - Modified order creation endpoint to create a single job with multiple files
   - All files in a single order now share the same `orderId` and `jobId`

3. **Search Capabilities**:
   - Updated search functionality in routes to find jobs by either `jobId` or `orderId`
   - Added username to job details for better identification

4. **Data Migration**:
   - Created a migration script (`migrateJobs.js`) to consolidate existing jobs
   - Script groups jobs by user+shop combination

5. **Security Improvements**:
   - Removed hardcoded MongoDB credentials
   - Added environment variable support with dotenv

## How to Use the Updated System

### Frontend Display
When displaying orders to users, use the `orderId` field which has a user-friendly format:
```
ORDER-1714408621019-5678
```

### Finding Jobs
Jobs can now be found by either their `jobId` or `orderId`:
```javascript
// Example
await PrintJob.findOne({
  $or: [
    { jobId },
    { orderId: jobId }
  ]
});
```

### Accessing File Information
Since files are now stored in an array, they should be accessed like:
```javascript
// Example 
const firstFile = job.files[0];
console.log(firstFile.filename);
console.log(firstFile.printConfig.copies);
```

## Running the Migration

To migrate existing data to the new format:

1. Make sure MongoDB is running
2. Create a backup of your data
3. Run the migration script:
   ```
   npm run migrate
   ```
4. Check the logs to ensure migration completed successfully

## Troubleshooting

If you encounter issues:

1. Check the MongoDB connection string in your `.env` file
2. Ensure all required fields are provided when creating a new job
3. If the migration fails, you can safely run it again as it creates new consolidated jobs
