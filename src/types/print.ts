export type ColorMode = 'BlackAndWhite' | 'Color';
export type PaperSize = 'A4' | 'A3' | 'Letter' | 'Legal' | 'Executive';
export type PaperType = 'Standard' | 'Glossy' | 'Recycled' | 'Cardstock';
export type BindingType = 'None' | 'Staple' | 'Punch' | 'Spiral';
export type BindingPosition = 'Left' | 'Top' | 'Right' | 'Bottom';
export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error' | 'queued';

export interface BindingOptions {
  type: BindingType;
  position: BindingPosition;
}
export interface PrintOptions {
  paperSize: PaperSize;
  colorMode: ColorMode;
  doubleSided: boolean;
  copies: number;
  paperType: PaperType;
  binding?: {
    type: BindingType;
    position: BindingPosition;
  };
  priority?: boolean;
  additionalInstructions?: string;
}

export interface PrintFile {
  id: string;
  file: File;
  pageCount: number;
  selectedPages: string;
  thumbnail: string | null;
  options: PrintOptions;
  price: number;
  isExpanded?: boolean;
}

export interface PrintOrder {
  files: Array<{
    name: string;
    pageCount: number;
    selectedPages: string;
    options: PrintOptions;
    price: number;
  }>;
  totalPrice: number;
}

export interface PendingUpload {
  id: string;
  fileData: Blob;
  metadata: {
    name: string;
    type: string;
    size: number;
  };
  uploadStatus: UploadStatus;
  priority: boolean;
  createdAt: Date;
}