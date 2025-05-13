// migrateJobs.js
const mongoose = require('mongoose');
require('dotenv').config();
const { MongoClient } = require('mongodb');

// Function to migrate data
async function migrateData() {
  // Connect to MongoDB
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/printproject';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const printJobsCollection = db.collection('printjobs');

    // Query to get all existing print jobs
    const existingJobs = await printJobsCollection.find({}).toArray();
    console.log(`Found ${existingJobs.length} existing print jobs to migrate`);

    // Group jobs by userId + shopkeeperId combination
    const jobGroups = {};

    existingJobs.forEach(job => {
      // Create a grouping key that combines userId and shopkeeperId
      const groupKey = `${job.userId}_${job.shopkeeperId}`;
      
      // Initialize the group if it doesn't exist
      if (!jobGroups[groupKey]) {
        jobGroups[groupKey] = {
          jobs: [],
          shopkeeperId: job.shopkeeperId,
          userId: job.userId
        };
      }
      
      // Add job to the appropriate group
      jobGroups[groupKey].jobs.push(job);
    });

    console.log(`Grouped into ${Object.keys(jobGroups).length} order groups`);

    // Process each group to create consolidated jobs
    for (const [key, group] of Object.entries(jobGroups)) {
      // Create a new consolidated job
      const orderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      // Get basic user info from the first job
      const firstJob = group.jobs[0];
      
      const files = group.jobs.map(job => ({
        filename: job.file?.filename || 'unknown.pdf',
        originalName: job.file?.originalName || 'unknown.pdf',
        contentType: job.file?.contentType,
        size: job.file?.size,
        uploadDate: job.file?.uploadDate || job.timeline?.created || new Date(),
        fileId: job.file?.fileId,
        printConfig: {
          copies: job.printConfig?.copies || 1,
          colorMode: job.printConfig?.colorMode || 'blackAndWhite',
          pageSize: job.printConfig?.pageSize || 'A4',
          orientation: job.printConfig?.orientation || 'portrait',
          duplexPrinting: job.printConfig?.duplexPrinting || false,
          pageRange: job.printConfig?.pageRange || 'all',
          pagesPerSheet: job.printConfig?.pagesPerSheet || 1
        }
      }));
      
      // Create the consolidated job
      const consolidatedJob = {
        jobId: `JOB-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        orderId,
        userId: firstJob.userId,
        username: 'Migrated User', // Default username for migrated data
        shopkeeperId: firstJob.shopkeeperId,
        files,
        status: firstJob.status,
        pricing: firstJob.pricing,
        payment: firstJob.payment,
        timeline: firstJob.timeline,
        deliveryMethod: firstJob.deliveryMethod || 'pickup',
        createdAt: firstJob.createdAt || new Date(),
        updatedAt: new Date()
      };
      
      // Insert the consolidated job
      await printJobsCollection.insertOne(consolidatedJob);
      console.log(`Created consolidated job with ID ${consolidatedJob.jobId} containing ${files.length} files`);
      
      // Optionally, mark old jobs as migrated (instead of deleting)
      /*
      const jobIds = group.jobs.map(job => job._id);
      await printJobsCollection.updateMany(
        { _id: { $in: jobIds } },
        { $set: { status: 'migrated', migratedToJobId: consolidatedJob.jobId } }
      );
      */
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await client.close();
  }
}

// Run the migration
migrateData().catch(console.error);
