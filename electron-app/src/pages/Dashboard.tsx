import { useState, useEffect } from 'react';
import { BarChart3, DollarSign, FileText } from 'lucide-react';
import Sidebar from '../components/Dashboard/Sidebar';
import Header from '../components/Dashboard/Header';
import StatsCard from '../components/Dashboard/StatsCard';
import PrinterCard from '../components/Dashboard/PrinterCard';
import PrintJob from '../components/Dashboard/PrintJob';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/context/AuthContext';
import { 
  AlertDialog,
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [automationEnabled, setAutomationEnabled] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogTitle, setDialogTitle] = useState('');
  const [onlinePrinterCount, setOnlinePrinterCount] = useState(5); // All printers are initially online
  const { user } = useAuth();

  // Add loading state for API data
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading data from API
  useEffect(() => {
    // In a real app, this would be where you'd fetch print jobs and printer data from your API
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Sample printer data
  const printers = [
    { id: 'PR001', name: 'Office Printer' },
    { id: 'PR002', name: 'Reception Printer' },
    { id: 'PR003', name: 'Marketing Printer' },
    { id: 'PR004', name: 'Executive Printer' },
    { id: 'PR005', name: 'HR Printer' },
  ];

  // Sample print jobs
  const printJobs = [
    { orderId: '12345', pdfCount: 3, cost: '$15.99' },
    { orderId: '12346', pdfCount: 1, cost: '$5.50' },
    { orderId: '12347', pdfCount: 5, cost: '$25.75' },
    { orderId: '12348', pdfCount: 2, cost: '$12.99' },
    { orderId: '12349', pdfCount: 4, cost: '$20.50' },
  ];
  const handleAutomationToggle = () => {
    const newStatus = !automationEnabled;
    setDialogTitle('Automation Status Change');
    setDialogMessage(`${newStatus ? 'Enabling' : 'Disabling'} automatic printing. ${newStatus ? 'Print jobs will now be sent automatically to online printers.' : 'Print jobs will require manual printing.'}`);
    setShowDialog(true);
    setAutomationEnabled(newStatus);
  };
  const handlePrint = (orderId: string) => {
    alert(`Printing order #${orderId}`);
  };
  
  const handlePrinterStatusChange = (id: string, isOnline: boolean) => {
    if (isOnline) {
      setOnlinePrinterCount(prev => prev + 1);
      setDialogTitle('Printer Online');
      setDialogMessage(`Printer ${id} is now online. Automated print jobs will be sent to this printer.`);
    } else {
      setOnlinePrinterCount(prev => prev - 1);
      setDialogTitle('Printer Offline');
      setDialogMessage(`Printer ${id} is now offline. No automated print jobs will be sent to this printer.`);
    }
    setShowDialog(true);
  };

  // Loading state JSX
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-500">Loading shop data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background font-gemini">      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className={`flex-1 p-8 transition-all duration-300 ${sidebarCollapsed ? 'ml-3' : 'ml-6'}`}>
        <Header userName={user?.name} />
        
        <div className="flex items-center mb-6">
          <h2 className="text-lg font-semibold mr-4">Automation</h2>
          <div className="flex items-center">
            <Switch 
              checked={automationEnabled} 
              onCheckedChange={handleAutomationToggle} 
              className={automationEnabled ? "bg-green-500" : "bg-red-500"}
            />
            <span className="ml-2 text-sm">{automationEnabled ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
          {/* Print Jobs - Scrollable Column */}
          <div className="flex flex-col h-full">
            <h3 className="text-md font-semibold mb-4">Print Jobs</h3>
            <div className="overflow-y-auto h-full pr-2 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {/* Print Jobs with numbering */}
              {printJobs.map((job, index) => (
                <div className="mb-3" key={job.orderId}>
                  <PrintJob 
                    orderId={job.orderId}
                    pdfCount={job.pdfCount}
                    cost={job.cost}
                    automationEnabled={automationEnabled}
                    onPrint={() => handlePrint(job.orderId)}
                    queueNumber={index + 1}
                  />
                </div>
              ))}
              
              {/* Stats at the bottom of the column */}
              <div className="mt-6">
                <StatsCard 
                  title="Total Print Jobs" 
                  value={printJobs.length.toString()}
                  percentChange={15} 
                  icon={<FileText className="w-5 h-5 text-primary" />} 
                  additionalInfo="Last week total: 12"
                />
              </div>
            </div>
          </div>

          {/* Queue Section - Scrollable Column */}
          <div className="flex flex-col h-full">
            <h3 className="text-md font-semibold mb-4">Queue Section</h3>
            <div className="overflow-y-auto h-full pr-2 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">              {/* Print Jobs in queue */}
              {printJobs.map((job, index) => (
                <div className="mb-3" key={`queue-${job.orderId}`}>
                  <PrintJob 
                    orderId={job.orderId}
                    pdfCount={job.pdfCount}
                    cost={job.cost}
                    automationEnabled={automationEnabled}
                    onPrint={() => handlePrint(job.orderId)}
                    showPrintButton={false}
                  />
                </div>
              ))}

              {/* Queue stats */}
              <div className="mt-6">
                <StatsCard 
                  title="In Queue" 
                  value={printJobs.length.toString()}
                  percentChange={-10} 
                  icon={<BarChart3 className="w-5 h-5 text-primary" />} 
                  additionalInfo="Processing time: ~5 min"
                />
              </div>
            </div>
          </div>

          {/* Printer Section - Scrollable Column */}
          <div className="flex flex-col h-full">
            <h3 className="text-md font-semibold mb-4">Printer Section</h3>
            <div className="overflow-y-auto h-full pr-2 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {/* Printer List */}
              <div className="space-y-2 mb-6">
                {printers.map((printer) => (
                  <PrinterCard 
                    key={printer.id} 
                    name={printer.name} 
                    id={printer.id}
                    onStatusChange={handlePrinterStatusChange}
                  />
                ))}
              </div>

              {/* Printer stats */}
              <div className="mt-6">
                <StatsCard 
                  title="Online Printers" 
                  value={`${onlinePrinterCount}/${printers.length}`} 
                  percentChange={onlinePrinterCount === printers.length ? 100 : Math.round((onlinePrinterCount / printers.length) * 100)} 
                  icon={<DollarSign className="w-5 h-5 text-primary" />} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>      {/* Status Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;