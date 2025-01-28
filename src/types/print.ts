export type PaperSize = 'A4' | 'Letter' | 'Legal';
export type ColorMode = 'Color' | 'BlackAndWhite';
export type PaperType = 'Standard' | 'Premium' | 'Recycled';

export interface PrintOptions {
  paperSize: PaperSize;
  colorMode: ColorMode;
  doubleSided: boolean;
  copies: number;
  paperType: PaperType;
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