export type PaperSize = 'A4' | 'A3' | 'Letter' | 'Legal';
export type ColorMode = 'Color' | 'BlackAndWhite';
export type Orientation = 'Portrait' | 'Landscape';
export type PagesPerSheet = '1' | '2' | '4' | '6' | '9';
export type BorderStyle = 'None' | 'Thin' | 'Medium' | 'Thick';

export interface PrintOptions {
  paperSize: PaperSize;
  colorMode: ColorMode;
  doubleSided: boolean;
  pagesPerSheet: PagesPerSheet;
  orientation: Orientation;
  borderStyle: BorderStyle;
  pageRange: string;
  copies: number;
  paperType: PaperType;
  isPriority: boolean;
}

export interface PrintFile {
  id: string;
  file: File;
  pageCount: number;
  selectedPages: string;
  thumbnail: string | null;
  options: PrintOptions;
  price: number;
}

export interface ValidationError {
  field: string;
  message: string;
}
export interface PageSelectorProps {
  pageCount: number;
  value: string;
  onChange: (pages: string) => void;
  isDarkTheme?: boolean; // Add this line to include the isDarkTheme prop
}