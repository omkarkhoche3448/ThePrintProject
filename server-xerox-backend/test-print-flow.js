require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { MongoClient } = require('mongodb');

// Configuration
const PRINT_SERVER_URL = 'http://localhost:3001/api/print';
const DB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin@customerservicechat.4uk1s.mongodb.net/?retryWrites=true&w=majority&appName=CustomerServiceChat';
const DB_NAME = 'test';
const COLLECTION_NAME = 'printjobs';

async function main() {
  console.log('===== PRINT FLOW TEST =====');
  
  // Step 1: Check if print server is running
  console.log('\n1. Checking print server...');
  try {
    await axios.get('http://localhost:3001/');
    console.log('✅ Print server is running');
  } catch (error) {
    console.error('❌ Print server is not running or not accessible');
    console.log('💡 Start the print server with: node server.js');
    process.exit(1);
  }
  
  // Step 2: Check MongoDB connection
  console.log('\n2. Checking MongoDB connection...');
  let client;
  try {
    client = await MongoClient.connect(DB_URI);
    console.log('✅ MongoDB connection successful');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
  
  // Step 3: Test direct print API
  console.log('\n3. Testing print API directly...');
  
  // Create a test PDF if it doesn't exist
  const testDir = path.join(__dirname, 'test');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }
  
  const pdfPath = path.join(testDir, 'test-print.pdf');
  if (!fs.existsSync(pdfPath)) {
    console.log('Creating a test PDF file...');
    // Create a simple PDF with text content
    fs.writeFileSync(pdfPath, '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>>>>>>/Parent 2 0 R>>endobj 4 0 obj<</Length 67>>stream\nBT\n/F1 24 Tf\n100 700 Td\n(Test Print Document) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000254 00000 n\ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n372\n%%EOF\n');
  }
  
  const configPath = path.join(testDir, 'test-config.json');
  const testConfig = {
    printer: "Virtual_PDF_Printer_1",
    copies: 1,
    duplex: false,
    pages_per_sheet: 1,
    orientation: "portrait",
    paper_size: "A4",
    border: "none",
    color_mode: "monochrome",
    page_ranges: "1-3",
    priority: 88,
    username: "Test User",
    "Order ID": "TEST-ORDER-1234"
  };
  
  fs.writeFileSync(configPath, JSON.stringify(testConfig, null, 2));
  
  try {
    const formData = new FormData();
    formData.append('pdf', fs.createReadStream(pdfPath));
    formData.append('config', JSON.stringify(testConfig));
    
    const response = await axios.post(PRINT_SERVER_URL, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    console.log('✅ Print API test successful:', response.data);
  } catch (error) {
    console.error('❌ Print API test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
  
  // Step 4: Check for processing jobs in MongoDB
  console.log('\n4. Checking for processing jobs in MongoDB...');
  try {
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const processingJobs = await collection.find({ status: 'processing' }).toArray();
    console.log(`Found ${processingJobs.length} jobs with 'processing' status`);
    
    if (processingJobs.length > 0) {
      console.log('Sample job:', JSON.stringify(processingJobs[0], null, 2));
    } else {
      console.log('💡 No processing jobs found. Try clicking the print button in your app.');
    }
  } catch (error) {
    console.error('❌ Error querying MongoDB:', error);
  }
  
  // Clean up
  if (client) {
    await client.close();
  }
  
  console.log('\n===== TEST COMPLETE =====');
}

main().catch(console.error);