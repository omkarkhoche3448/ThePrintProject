export type PaperSize = 'A4' | 'A3' | 'Letter' | 'Legal';
export type ColorMode = 'color' | 'monochrome';
export type Orientation = 'portrait' | 'landscape';
export type PagesPerSheet = '1' | '2' | '4' | '6';
export type BorderStyle = 'none' | 'single';

export interface PrintOptions {
  paperSize: PaperSize;
  colorMode: ColorMode;
  doubleSided: boolean;
  pagesPerSheet: PagesPerSheet;
  orientation: Orientation;
  borderStyle: BorderStyle;
  pageRange: string;
  copies: number;
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
  isDarkTheme?: boolean;
}