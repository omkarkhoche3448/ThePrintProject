import React from 'react';
import { Monitor, Power, PowerOff, HelpCircle, MapPin } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Printer } from '../../types';

interface PrintersListProps {
  printers: Printer[];
}

const PrintersList: React.FC<PrintersListProps> = ({ printers }) => {
  const [updatingPrinters, setUpdatingPrinters] = React.useState<Record<string, boolean>>({});

  const togglePrinterStatus = (printerId: string, isActive: boolean) => {
    setUpdatingPrinters((prev) => ({ ...prev, [printerId]: true }));
    
    // Simulate API call with timeout
    setTimeout(() => {
      setUpdatingPrinters((prev) => ({ ...prev, [printerId]: false }));
    }, 1000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge variant="success">Online</Badge>;
      case 'offline':
        return <Badge variant="secondary">Offline</Badge>;
      case 'error':
        return <Badge variant="danger">Error</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-xerox-gray-900 flex items-center">
          <Monitor className="w-5 h-5 mr-2 text-xerox-blue-500" />
          Printers
        </h2>
        <Badge variant="primary" className="px-3 py-1">
          {printers.length} Printers
        </Badge>
      </div>
      
      <div className="overflow-y-auto flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-3">
          {printers.map((printer) => (
            <Card 
              key={printer.id} 
              className={`hover:shadow-md transition-shadow duration-200 border-l-4 ${
                printer.status === 'online' 
                  ? 'border-l-xerox-green-500' 
                  : printer.status === 'error' 
                    ? 'border-l-red-500' 
                    : 'border-l-xerox-gray-300'
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-medium">{printer.name}</CardTitle>
                  {getStatusBadge(printer.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-xerox-gray-500 mb-3">
                  <div className="flex items-center mb-1">
                    <div className="text-xs text-xerox-gray-500">{printer.model}</div>
                  </div>
                  <div className="flex items-center text-xs mb-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    {printer.location}
                  </div>
                  {printer.status === 'online' && (
                    <div className="text-xs text-xerox-green-600">
                      Currently processing {printer.jobCount} {printer.jobCount === 1 ? 'job' : 'jobs'}
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <Button size="sm" variant="outline" className="text-xs">
                    <HelpCircle className="w-3 h-3 mr-1" />
                    Status
                  </Button>
                  <Button 
                    size="sm" 
                    variant={printer.isActive ? "destructive" : "success"}
                    className="text-xs"
                    onClick={() => togglePrinterStatus(printer.id, !printer.isActive)}
                    loading={updatingPrinters[printer.id]}
                    disabled={printer.status === 'error'}
                  >
                    {printer.isActive ? (
                      <>
                        <PowerOff className="w-3 h-3 mr-1" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Power className="w-3 h-3 mr-1" />
                        Start
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrintersList;