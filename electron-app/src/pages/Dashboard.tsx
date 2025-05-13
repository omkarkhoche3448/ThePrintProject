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
import { toast } from "@/hooks/use-toast";
import websocketService from '@/services/websocketService';
import printJobService, { PrintJob as PrintJobType } from '@/services/printJobService';

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
  
  // State for print jobs from WebSocket
  const [printJobs, setPrintJobs] = useState<PrintJobType[]>([]);
  const [jobsInQueue, setJobsInQueue] = useState<PrintJobType[]>([]);
  const [webSocketConnected, setWebSocketConnected] = useState(false);

  // Sample printer data (keep this for now)
  const printers = [
    { id: 'PR001', name: 'Office Printer' },
    { id: 'PR002', name: 'Reception Printer' },
    { id: 'PR003', name: 'Marketing Printer' },
    { id: 'PR004', name: 'Executive Printer' },
    { id: 'PR005', name: 'HR Printer' },
  ];

  // Handle WebSocket connection status
  const handleConnectionStatus = (status: 'connected' | 'disconnected' | 'error') => {
    setWebSocketConnected(status === 'connected');
    
    if (status === 'connected') {
      toast({
        title: "Connected to Print Server",
        description: "You will receive real-time print job updates."
      });
    } else if (status === 'disconnected') {
      toast({
        title: "Disconnected from Print Server",
        description: "You will not receive real-time updates.",
        variant: "destructive"
      });
    } else if (status === 'error') {
      toast({
        title: "Connection Error",
        description: "Failed to connect to print server.",
        variant: "destructive"
      });
    }
  };

  // Handle new print job from WebSocket
  const handleNewJob = (job: PrintJobType) => {
    setPrintJobs(prevJobs => [job, ...prevJobs]);
    if (job.status === 'pending') {
      setJobsInQueue(prevJobs => [job, ...prevJobs]);
    }
  };

  // Handle print job update from WebSocket
  const handleJobUpdate = (updatedJob: PrintJobType) => {
    // Update the job in the print jobs list
    setPrintJobs(prevJobs => prevJobs.map(job => 
      job.jobId === updatedJob.jobId ? updatedJob : job
    ));
    
    // Update or remove the job from queue depending on status
    if (updatedJob.status === 'pending') {
      setJobsInQueue(prevJobs => {
        const exists = prevJobs.some(job => job.jobId === updatedJob.jobId);
        if (exists) {
          return prevJobs.map(job => job.jobId === updatedJob.jobId ? updatedJob : job);
        } else {
          return [...prevJobs, updatedJob];
        }
      });
    } else {
      // If job is no longer pending, remove from queue
      setJobsInQueue(prevJobs => prevJobs.filter(job => job.jobId !== updatedJob.jobId));
    }
  };

  // Initialize WebSocket and fetch initial data
  useEffect(() => {
    const initializeWebSocket = async () => {
      // Set up WebSocket event handlers
      websocketService.onConnectionStatus(handleConnectionStatus);
      websocketService.onNewJob(handleNewJob);
      websocketService.onJobUpdate(handleJobUpdate);
      
      // Connect to WebSocket server
      await websocketService.connect();
    };
    
    const fetchInitialJobs = async () => {
      try {
        setIsLoading(true);
        
        // Fetch initial print jobs
        const response = await printJobService.fetchJobs();
        if (response.success && response.jobs) {
          setPrintJobs(response.jobs);
          
          // Filter out only pending jobs for the queue
          const pendingJobs = response.jobs.filter(job => job.status === 'pending');
          setJobsInQueue(pendingJobs);
        }
      } catch (error) {
        console.error('Error fetching initial jobs:', error);
        toast({
          title: "Error",
          description: "Failed to fetch print jobs.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    // Initialize everything
    initializeWebSocket();
    fetchInitialJobs();
    
    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
    };
  }, []);

  const handleAutomationToggle = () => {
    const newStatus = !automationEnabled;
    setDialogTitle('Automation Status Change');
    setDialogMessage(`${newStatus ? 'Enabling' : 'Disabling'} automatic printing. ${newStatus ? 'Print jobs will now be sent automatically to online printers.' : 'Print jobs will require manual printing.'}`);
    setShowDialog(true);
    setAutomationEnabled(newStatus);
  };
  
  const handlePrint = async (orderId: string) => {
    try {
      // Find the job by orderId
      const job = printJobs.find(job => job.orderId === orderId);
      if (job) {
        // Call the service to start processing the job
        const response = await printJobService.executeJob(job.jobId);
        if (response.success) {
          toast({
            title: "Print Job Started",
            description: `Now printing order #${orderId}`
          });
        } else {
          toast({
            title: "Print Failed",
            description: response.message || "Failed to start print job",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error(`Error printing order ${orderId}:`, error);
      toast({
        title: "Print Error",
        description: `Failed to print order #${orderId}`,
        variant: "destructive"
      });
    }
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
          
          {/* WebSocket Connection Indicator */}
          <div className="ml-auto flex items-center">
            <div className={`w-3 h-3 rounded-full ${webSocketConnected ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
            <span className="text-sm">{webSocketConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
          {/* Print Jobs - Scrollable Column */}
          <div className="flex flex-col h-full">
            <h3 className="text-md font-semibold mb-4">Print Jobs</h3>
            <div className="overflow-y-auto h-full pr-2 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {/* Print Jobs with numbering */}
              {printJobs.length > 0 ? (
                printJobs.map((job, index) => (
                  <div className="mb-3" key={job.jobId}>
                    <PrintJob 
                      orderId={job.orderId}
                      pdfCount={job.pdfCount || job.filesCount}
                      cost={job.cost || '$0.00'}
                      automationEnabled={automationEnabled}
                      onPrint={() => handlePrint(job.orderId)}
                      queueNumber={index + 1}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-400">
                  No print jobs available
                </div>
              )}
              
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
            <div className="overflow-y-auto h-full pr-2 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">              
              {/* Print Jobs in queue */}
              {jobsInQueue.length > 0 ? (
                jobsInQueue.map((job) => (
                  <div className="mb-3" key={`queue-${job.jobId}`}>
                    <PrintJob 
                      orderId={job.orderId}
                      pdfCount={job.pdfCount || job.filesCount}
                      cost={job.cost || '$0.00'}
                      automationEnabled={automationEnabled}
                      onPrint={() => handlePrint(job.orderId)}
                      showPrintButton={false}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-400">
                  No jobs in queue
                </div>
              )}

              {/* Queue stats */}
              <div className="mt-6">
                <StatsCard 
                  title="In Queue" 
                  value={jobsInQueue.length.toString()}
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