const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

/**
 * Send a print job to the server
 * @param {string} pdfPath - Path to the PDF file
 * @param {string} configPath - Path to the config file
 * @returns {Promise<Object>} - Response from the server
 */
async function sendPrintJob(pdfPath, configPath) {
  const formData = new FormData();
  
  // Add PDF file
  formData.append('pdf', fs.createReadStream(pdfPath));
  
  // Add config
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  formData.append('config', JSON.stringify(config));
  
  try {
    const response = await axios.post('http://localhost:3000/api/print', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error sending print job for ${path.basename(pdfPath)}:`, error.message);
    return null;
  }
}

/**
 * Get all PDF files and their corresponding config files from the given folders
 * @param {string} pdfFolder - Path to the PDF files folder
 * @param {string} configFolder - Path to the config files folder
 * @returns {Array<{pdfPath: string, configPath: string}>} - Array of file pairs
 */
function getFilePairs(pdfFolder, configFolder) {
  const pdfFiles = fs.readdirSync(pdfFolder)
    .filter(file => file.toLowerCase().endsWith('.pdf'));
  
  const configFiles = fs.readdirSync(configFolder)
    .filter(file => file.toLowerCase().endsWith('.json'));
  
  return pdfFiles.map(pdfFile => {
    const baseName = path.basename(pdfFile, '.pdf');
    const configFile = `${baseName}config.json`;
    
    if (!configFiles.includes(configFile)) {
      console.warn(`Warning: No config file found for ${pdfFile}`);
      return null;
    }
    
    return {
      pdfPath: path.join(pdfFolder, pdfFile),
      configPath: path.join(configFolder, configFile)
    };
  }).filter(pair => pair !== null);
}

/**
 * Main function to send all print jobs
 */
async function main() {
  // Check command line arguments
  if (process.argv.length < 4) {
    console.log('Usage: node send_print_job.js <pdf_folder_path> <config_folder_path>');
    process.exit(1);
  }
  
  const pdfFolder = process.argv[2];
  const configFolder = process.argv[3];
  
  // Validate folders
  if (!fs.existsSync(pdfFolder)) {
    console.error(`Error: PDF folder not found: ${pdfFolder}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(configFolder)) {
    console.error(`Error: Config folder not found: ${configFolder}`);
    process.exit(1);
  }
  
  // Get all file pairs
  const filePairs = getFilePairs(pdfFolder, configFolder);
  
  if (filePairs.length === 0) {
    console.log('No matching PDF and config files found');
    process.exit(0);
  }
  
  console.log(`Found ${filePairs.length} PDF files with configs`);
  
  // Send print jobs
  const results = [];
  for (const pair of filePairs) {
    console.log(`\nSending print job for ${path.basename(pair.pdfPath)}...`);
    const result = await sendPrintJob(pair.pdfPath, pair.configPath);
    results.push({
      file: path.basename(pair.pdfPath),
      result
    });
  }
  
  // Print summary
  console.log('\nPrint Job Summary:');
  console.log('=================');
  results.forEach(({ file, result }) => {
    if (result) {
      console.log(`${file}: Success (Job ID: ${result.jobId}, Priority: ${result.priority})`);
    } else {
      console.log(`${file}: Failed`);
    }
  });
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 