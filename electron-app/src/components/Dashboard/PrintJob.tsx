import { FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface PrintJobProps {
  orderId: string;
  pdfCount: number;
  cost: string;
  automationEnabled: boolean;
  onPrint: () => void;
  queueNumber?: number;
  showPrintButton?: boolean;
}

const PrintJob = ({ orderId, pdfCount, cost, automationEnabled, onPrint, queueNumber, showPrintButton = true }: PrintJobProps) => {
  return (
    <div className="bg-white p-4 rounded-xl mb-2 border border-gray-100">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {queueNumber !== undefined && (
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3 font-medium">
              {queueNumber}
            </div>
          )}
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
            <FileText className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-800">Order #{orderId}</h4>
            <p className="text-xs text-gray-500">{pdfCount} PDFs • {cost}</p>
          </div>
        </div>
        
        {!automationEnabled && showPrintButton && (
          <Button 
            size="sm"
            onClick={onPrint}
            className="text-xs"
          >
            Print
          </Button>
        )}
      </div>
    </div>
  );
};

export default PrintJob;