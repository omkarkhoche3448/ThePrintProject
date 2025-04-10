import * as PDFJS from 'pdfjs-dist';
import PDFWorker from 'pdfjs-dist/build/pdf.worker.min?url';

// Use the bundled worker instead of CDN
PDFJS.GlobalWorkerOptions.workerSrc = PDFWorker;

export async function getPageCount(file: File): Promise<number> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFJS.getDocument(arrayBuffer).promise;
    return pdf.numPages;
  } catch (error) {
    console.error('Error getting page count:', error);
    throw new Error('Failed to process PDF file');
  }
}

export async function generateThumbnail(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFJS.getDocument(arrayBuffer).promise;
    const page = await pdf.getPage(1);
    
    const viewport = page.getViewport({ scale: 0.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Could not get canvas context');
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    return canvas.toDataURL();
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw new Error('Failed to generate PDF thumbnail');
  }
}