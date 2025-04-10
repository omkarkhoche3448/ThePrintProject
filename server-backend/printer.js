const { print } = require("unix-print");
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const path = require('path');

/**
 * Extracts specific pages from a PDF file
 * @param {string} pdfPath - Path to the source PDF file
 * @param {string} pageRanges - Page ranges string like "1-4,6,8-10"
 * @returns {Promise<Buffer>} - PDF buffer containing only the specified pages
 */
async function extractPages(pdfPath, pageRanges) {
  // Read the PDF file
  const pdfBytes = fs.readFileSync(pdfPath);
  const srcDoc = await PDFDocument.load(pdfBytes);
  const totalPages = srcDoc.getPageCount();
  
  // Parse page ranges
  const cleanRanges = pageRanges.replace(/\s+/g, '');
  const ranges = cleanRanges.split(',');
  const pageIndices = [];
  
  // Process each range or individual page
  for (const range of ranges) {
    if (range.includes('-')) {
      // Handle range (e.g., "1-4")
      const [start, end] = range.split('-').map(num => parseInt(num, 10));
      
      // Validate range values
      if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
        throw new Error(`Invalid page range: ${range}. Valid pages are 1-${totalPages}`);
      }
      
      // PDF page indices are 0-based, but user input is 1-based
      for (let i = start; i <= end; i++) {
        pageIndices.push(i - 1);
      }
    } else {
      // Handle single page (e.g., "6")
      const pageNum = parseInt(range, 10);
      
      // Validate page number
      if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
        throw new Error(`Invalid page number: ${range}. Valid pages are 1-${totalPages}`);
      }
      
      // PDF page indices are 0-based, but user input is 1-based
      pageIndices.push(pageNum - 1);
    }
  }
  
  // Create a new document with the selected pages
  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
  
  // Add each copied page to the new document
  for (const page of copiedPages) {
    newDoc.addPage(page);
  }
  
  // Serialize the new document
  const newPdfBytes = await newDoc.save();
  return Buffer.from(newPdfBytes);
}

/**
 * Prints a PDF file based on configuration in config.json
 * @param {string} pdfPath - Path to the PDF file
 * @param {string} configPath - Path to the config.json file
 * @returns {Promise} - Promise resolving to the print result
 */
async function printWithConfig(pdfPath, configPath) {
  // Check if files exist
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`PDF file not found: ${pdfPath}`);
  }
  
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }
  
  // Read and parse config
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  // Get printer name (using default printer if not specified)
  const printer = config.printer || "";
  
  // Build options array
  const options = [];
  
  // Handle number of copies
  if (config.copies !== undefined) {
    const copies = parseInt(config.copies, 10);
    if (isNaN(copies) || copies < 1) {
      throw new Error(`Invalid copies value: ${config.copies}. Must be a positive integer.`);
    }
    options.push(`-n ${copies}`);
  }
  
  // Handle duplex printing (one-sided vs back-to-back)
  if (config.duplex === true) {
    options.push("-o sides=two-sided-long-edge");
  } else {
    options.push("-o sides=one-sided");
  }
  
  // Handle pages per sheet (1, 2, 4, or 6)
  const pagesPerSheet = config.pages_per_sheet || 1;
  if ([1, 2, 4, 6].includes(pagesPerSheet)) {
    options.push(`-o number-up=${pagesPerSheet}`);
  } else {
    throw new Error(`Invalid pages per sheet: ${pagesPerSheet}. Must be 1, 2, 4, or 6.`);
  }
  
  // Handle orientation
  if (config.orientation === 'landscape') {
    options.push("-o landscape");
  } else {
    options.push("-o portrait");
  }
  
  // Handle paper size
  if (config.paper_size) {
    options.push(`-o media=${config.paper_size}`);
  } else {
    options.push("-o media=A4"); // Default to A4 if not specified
  }
  
  // Always ensure content fits on page with proper scaling
  options.push("-o fit-to-page");
  
  // Handle border
  if (config.border === 'none') {
    options.push("-o page-border=none");
  } else {
    options.push("-o page-border=single"); // Default border
  }
  
  // Handle color mode
  if (config.color_mode) {
    const colorMode = config.color_mode.toLowerCase();
    if (["monochrome", "bi-level", "color"].includes(colorMode)) {
      options.push(`-o print-color-mode=${colorMode}`);
    } else {
      throw new Error(`Invalid color mode: ${colorMode}. Must be "monochrome", "bi-level", or "color".`);
    }
  }
  
  // Handle page ranges by extracting specified pages
  let pdfToUse = pdfPath;
  let tempPdfPath = null;

  if (config.page_ranges) {
    // Validate format (should match: digits, hyphens, commas)
    if (!/^[0-9,-\s]+$/.test(config.page_ranges)) {
      throw new Error(`Invalid page range format: ${config.page_ranges}. Use format like "1-4,12,17-20"`);
    }
    
    try {
      // Extract the requested pages
      const extractedPdfBuffer = await extractPages(pdfPath, config.page_ranges);
      
      // Create a temporary file
      const fileExt = path.extname(pdfPath);
      const fileName = path.basename(pdfPath, fileExt);
      tempPdfPath = `${fileName}_extracted_pages${fileExt}`;
      
      // Write the extracted pages to the temporary file
      fs.writeFileSync(tempPdfPath, extractedPdfBuffer);
      
      // Use the temporary file for printing
      pdfToUse = tempPdfPath;
      
      console.log(`Created PDF with extracted pages: ${tempPdfPath}`);
    } catch (error) {
      throw new Error(`Failed to extract pages: ${error.message}`);
    }
  }
  
  // Log the options being used
  console.log(`Printing ${pdfToUse} with options:`, options);
  
  try {
    // Execute the print job
    const result = await print(pdfToUse, printer, options);
    
    // Clean up temporary file if created
    if (tempPdfPath && fs.existsSync(tempPdfPath)) {
      fs.unlinkSync(tempPdfPath);
      console.log(`Cleaned up temporary file: ${tempPdfPath}`);
    }
    
    return result;
  } catch (error) {
    // Clean up temporary file if created, even if printing fails
    if (tempPdfPath && fs.existsSync(tempPdfPath)) {
      fs.unlinkSync(tempPdfPath);
      console.log(`Cleaned up temporary file: ${tempPdfPath}`);
    }
    
    throw error;
  }
}

/**
 * Main function to execute from command line
 */
async function main() {
  if (process.argv.length < 4) {
    console.log("Usage: node printer.js <pdf_file_path> <config_json_path>");
    process.exit(1);
  }
  
  const pdfPath = process.argv[2];
  const configPath = process.argv[3];
  
  try {
    const result = await printWithConfig(pdfPath, configPath);
    console.log("Print job submitted successfully:", result);
  } catch (error) {
    console.error("Error printing document:", error.message);
    process.exit(1);
  }
}

// Execute if called directly from command line
if (require.main === module) {
  main();
} else {
  // Export for use as a module
  module.exports = { printWithConfig };
} 