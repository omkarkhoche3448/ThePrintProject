import React from 'react';
import { CollapsibleFileView } from './CollapsibleFileView';
import type { PrintFile, PrintOptions } from '../../types/print';

interface FileDetailsProps {
  file: PrintFile;
  onPageSelection: (pages: string) => void;
  onOptionsChange: (options: PrintOptions) => void;
  onRemoveFile?: (id: string) => void;
  isDarkTheme: boolean;
}

const FileDetails: React.FC<FileDetailsProps> = ({
  file,
  onPageSelection,
  onOptionsChange,
  onRemoveFile = () => {},
  isDarkTheme,
}) => {
  return (
    <CollapsibleFileView
      file={file}
      onPageSelection={onPageSelection}
      onOptionsChange={onOptionsChange}
      onRemoveFile={onRemoveFile}
      isDarkTheme={isDarkTheme}
    />
  );
};

export default FileDetails;