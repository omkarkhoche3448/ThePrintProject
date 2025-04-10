# PDF Printer Utility

A Node.js utility for printing PDF files with configurable printing options.

## Installation

```bash
npm install
```

## Usage

The utility takes a PDF file and a config.json file as input:

```bash
node printer.js <pdf_file_path> <config_json_path>
```

Example:

```bash
node printer.js print-color-test-page-basic-1.pdf sample-config.json
```

## Configuration Options

Create a config.json file with the following options:

```json
{
  "printer": "PrinterName",      // Optional: Name of the printer. Uses default if omitted
  "copies": 2,                   // Number: Number of copies to print
  "duplex": true,                // Boolean: true for back-to-back printing, false for one-sided
  "pages_per_sheet": 2,          // Number: 1, 2, 4, or 6 pages per sheet
  "orientation": "landscape",    // String: "landscape" or "portrait"
  "paper_size": "A4",            // String: "A2", "A3", "A4", etc.
  "border": "none",              // String: "default" or "none"
  "page_ranges": "1-4, 12, 17-20", // String: Specific pages to print (optional)
  "color_mode": "monochrome"     // String: "monochrome", "bi-level", or "color"
}
```

## Features

- Supports both one-sided and duplex printing
- Multiple copies option
- Options for 1, 2, 4, or 6 pages per sheet
- Portrait or landscape orientation
- Different paper sizes (A2, A3, A4, etc.)
- Border options
- Automatically scales content to fit the page properly (no cropping)
- Print specific page ranges
- Color mode selection (monochrome, bi-level, color)

### Color Mode Options

- **Monochrome**: Grayscale printing using 1 color, usually black
- **Bi-level**: Black and white printing using only black ink (no grayscale)
- **Color**: Full color printing as per the document

## Notes

The utility uses the CUPS printing system via the `unix-print` library, ensuring compatibility with Linux systems. 