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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import websocketService from '@/services/websocketService';
import printJobService, { PrintJob as PrintJobType } from '@/services/printJobService';
import printerService, { Printer as PrinterType } from '@/services/printerService';

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [automationEnabled, setAutomationEnabled] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogTitle, setDialogTitle] = useState('');
  const [onlinePrinterCount, setOnlinePrinterCount] = useState(0);
  const { user } = useAuth();

  // Add loading state for API data
  const [isLoading, setIsLoading] = useState(true);

  // State for print jobs from WebSocket
  const [printJobs, setPrintJobs] = useState<PrintJobType[]>([]);
  const [webSocketConnected, setWebSocketConnected] = useState(false);

  // State for printers
  const [printers, setPrinters] = useState<PrinterType[]>([]);

  // Printer selection modal state
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [selectedPrinterId, setSelectedPrinterId] = useState<string>('');
  const [currentJobId, setCurrentJobId] = useState<string>('');

  // Handle printer status change
  const handlePrinterStatusChange = async (printerId: string, isOnline: boolean) => {
    try {
      const response = await printerService.setPrinterStatus(printerId, isOnline);
      if (response.success) {
        // Update local state
        setPrinters(prev =>
          prev.map(printer =>
            printer.id === printerId ? { ...printer, online: isOnline } : printer
          )
        );

        // Update online printer count
        const updatedOnlinePrinters = printers.filter(p =>
          p.id === printerId ? isOnline : p.online
        ).length;
        setOnlinePrinterCount(updatedOnlinePrinters);
      }
    } catch (error) {
      console.error('Error changing printer status:', error);
      toast({
        title: 'Status Change Error',
        description: 'Failed to update printer status',
        variant: 'destructive'
      });
    }
  };

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

    // Log useful debugging info for the priority system
    const priorityScore = calculatePriorityScore(job);
    console.log(`New job received: #${job.orderId} from ${job.username || 'Unknown'}`);
    console.log(`Priority details: Score: ${priorityScore}, Priority Fee: ${job.pricing?.priorityFee || 0}, Pages: ${job.pricing?.totalPages || job.pdfCount || job.filesCount || 'Unknown'}`);
  };

  // Handle print job update from WebSocket
  const handleJobUpdate = (updatedJob: PrintJobType) => {
    setPrintJobs(prevJobs => prevJobs.map(job =>
      job.jobId === updatedJob.jobId ? updatedJob : job
    ));
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
        }

        // Fetch printers
        const printersResponse = await printerService.getPrinters();
        if (printersResponse.success && printersResponse.printers) {
          setPrinters(printersResponse.printers);

          // Count online printers
          const onlinePrinters = printersResponse.printers.filter(p => p.online).length;
          setOnlinePrinterCount(onlinePrinters);

          // Get automation status
          if (printersResponse.automationEnabled !== undefined) {
            setAutomationEnabled(printersResponse.automationEnabled);
          }
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch initial data.",
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

  const handleAutomationToggle = async () => {
    const newStatus = !automationEnabled;
    setDialogTitle('Automation Status Change');
    setDialogMessage(`${newStatus ? 'Enabling' : 'Disabling'} automatic printing. ${newStatus ? 'Print jobs will now be sent automatically to online printers.' : 'Print jobs will require manual printing.'}`);
    setShowDialog(true);

    // Update automation status through service
    await printerService.setAutomationEnabled(newStatus);

    // Update local state
    setAutomationEnabled(newStatus);
  };

  const handlePrint = async (orderId: string) => {
    try {
      // Find the job by orderId
      const job = printJobs.find(job => job.orderId === orderId);
      if (!job) {
        console.error(`Job with orderId ${orderId} not found`);
        toast({
          title: "Print Error",
          description: `Job with order ID #${orderId} not found`,
          variant: "destructive"
        });
        return;
      }

      if (automationEnabled) {
        // Automated printing - use the existing logic
        await printerService.printJob(job.jobId);

        // Call the original service to update the job status in backend
        const response = await printJobService.executeJob(job.jobId);

        if (response.success) {
          // Update local state to reflect job status change to "processing"
          handleJobUpdate({
            ...job,
            status: 'processing'
          });
        }
      } else {
        // Manual printing - show printer selection modal
        setCurrentJobId(job.jobId);
        setSelectedPrinterId(''); // Reset selection
        setShowPrinterModal(true);
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

  // Handle manual printer selection and printing
  const handleManualPrint = async () => {
    if (!selectedPrinterId || !currentJobId) {
      toast({
        title: "Printer Selection Required",
        description: "Please select a printer",
        variant: "destructive"
      });
      return;
    }

    try {
      // Close the modal first
      setShowPrinterModal(false);

      // Print to specific printer
      await printerService.printJob(currentJobId, selectedPrinterId);

      // Update job status
      const response = await printJobService.executeJob(currentJobId, selectedPrinterId);

      if (response.success) {
        // Find and update the job in the local state
        const job = printJobs.find(job => job.jobId === currentJobId);
        if (job) {
          handleJobUpdate({
            ...job,
            status: 'processing'
          });
        }

        toast({
          title: "Print Job Sent",
          description: `Job sent to printer successfully`,
        });
      }
    } catch (error) {
      console.error('Error in manual printing:', error);
      toast({
        title: "Print Error",
        description: "Failed to send job to printer",
        variant: "destructive"
      });
    } finally {
      // Reset state
      setCurrentJobId('');
      setSelectedPrinterId('');
    }
  };

  // Helper function to calculate job priority score 
  const calculatePriorityScore = (job: PrintJobType): number => {
    if (!job) return 0;

    // Priority score algorithm:
    // 1. Priority fee: +50 points if paid, +30 if shopkeeper priority
    // 2. Age: +0.5 points per minute (up to 60 minutes) to prevent jobs from aging too long
    // 3. Page count: Small jobs (<10 pages) get bonus points to move ahead
    //    Large jobs (>50 pages) get slightly penalized to avoid blocking the queue

    // Base score starts at 0
    let score = 0;

    // Factor 1: Priority fee (highest weight)
    const hasPriorityFee = job.pricing?.priorityFee && job.pricing.priorityFee > 0;
    const isShopkeeperPriority = job.pricing?.isShopkeeperPriority;

    if (hasPriorityFee) {
      score += 50;
    } else if (isShopkeeperPriority) {
      score += 30;
    }

    // Factor 2: Job age - older jobs should get higher priority to avoid aging
    // We don't have access to exact timestamp here, so use the jobId which contains timestamp
    // Format: JOB-timestamp-random
    if (job.jobId) {
      const parts = job.jobId.split('-');
      if (parts.length >= 2) {
        const timestamp = parseInt(parts[1], 10);
        if (!isNaN(timestamp)) {
          // Current time
          const now = Date.now();
          // Calculate age in minutes (max 60 minutes = 1 hour)
          const ageInMinutes = Math.min(60, Math.floor((now - timestamp) / (1000 * 60)));
          // Add 0.5 points per minute of age (max 30 points for being 1 hour old)
          score += ageInMinutes * 0.5;
        }
      }
    }

    // Factor 3: Page count (small jobs get priority)
    const pageCount = job.pricing?.totalPages || job.pdfCount || job.filesCount || 1;
    // For jobs with less than 10 pages, add bonus points
    if (pageCount <= 10) {
      score += Math.max(0, 10 - pageCount) * 2; // max 20 points for 1-page jobs
    } else {
      // For larger jobs, slightly reduce priority (never below 0)
      score = Math.max(0, score - Math.min(10, Math.floor(pageCount / 50)));
    }

    // Round to nearest integer for cleaner display
    return Math.round(score);
  };

  // Filter jobs for UI sections
  const pendingJobs = printJobs.filter(job => job.status === 'pending');
  const processingJobs = printJobs.filter(job => job.status === 'processing');

  // Sort pending jobs to prioritize urgent jobs
  const sortedPendingJobs = [...pendingJobs].sort((a, b) => {
    return calculatePriorityScore(b) - calculatePriorityScore(a);
  });

  // Loading state JSX
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-500">Loading shop data...</p>
      </div>
    );
  }

  // Get online printers for selection modal
  const onlinePrinters = printers.filter(printer => printer.online);

  return (
    <div className="min-h-screen flex bg-background font-gemini">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      <div className={`flex-1 p-8 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
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
          <div className="ml-auto flex items-center mr-6">
            <div className={`w-3 h-3 rounded-full ${webSocketConnected ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
            <span className="text-sm">{webSocketConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)] overflow-hidden">
          {/* Print Jobs - Scrollable Column */}
          <div className="flex flex-col h-full max-h-[calc(100vh-220px)] overflow-hidden">
            <div className="flex items-center justify-between mb-4 flex-shrink-0 px-1">
              <h3 className="text-md font-semibold">Print Jobs (Priority Queue)</h3>
              {/* <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm">
                <span className="font-medium">{pendingJobs.length}</span>
                <span className="ml-1 text-gray-500">jobs</span>
              </div> */}
            </div>
            
            {/* Stats card outside scrollable area */}
            <div className="mb-4 flex-shrink-0 ">
              <StatsCard
                title="Total Print Jobs"
                value={pendingJobs.length.toString()}
                percentChange={15}
                icon={<FileText className="w-5 h-5 text-primary" />}
                additionalInfo={`${sortedPendingJobs.length} jobs with priority scoring`}
              />
            </div>
            
            <div className="overflow-y-auto flex-grow pr-2 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 h-[calc(100vh-420px)]">
              {/* Only show jobs with status 'pending' */}
              {sortedPendingJobs.length > 0 ? (
                sortedPendingJobs.map((job, index) => (
                  <div className="mb-3" key={job.jobId}>
                    <PrintJob
                      orderId={job.orderId}
                      pdfCount={job.pdfCount || job.filesCount || job.fileCount || 0}
                      cost={job.amount ? `Rs ${job.amount.toFixed(2)}` : (job.cost || '$0.00')}
                      username={job.username}
                      automationEnabled={automationEnabled}
                      onPrint={() => handlePrint(job.orderId)}
                      queueNumber={index + 1}
                      priorityScore={calculatePriorityScore(job)}
                    />
                  </div>
                ))
              ) : (
                <div className="text-start py-6 text-gray-400">
                  No print jobs available
                </div>
              )}
            </div>
          </div>

          {/* Queue Section - Scrollable Column */}
          <div className="flex flex-col h-full max-h-[calc(100vh-220px)] overflow-hidden">
            <div className="flex items-center justify-between mb-4 flex-shrink-0 px-1">
              <h3 className="text-md font-semibold">Queue Section</h3>
              {/* <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm">
                <span className="font-medium">{processingJobs.length}</span>
                <span className="ml-1 text-gray-500">in queue</span>
              </div> */}
            </div>
            
            {/* Stats card outside scrollable area */}
            <div className="mb-4 flex-shrink-0">
              <StatsCard
                title="In Queue"
                value={processingJobs.length.toString()}
                percentChange={-10}
                icon={<BarChart3 className="w-5 h-5 text-primary" />}
                additionalInfo="Processing time: ~5 min"
              />
            </div>
            
            <div className="overflow-y-auto flex-grow pr-2 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 h-[calc(100vh-420px)]">
              {/* Only show jobs with status 'processing' */}
              {processingJobs.length > 0 ? (
                processingJobs.map((job, index) => (
                  <div className="mb-3" key={`queue-${job.jobId}`}>
                    <PrintJob
                      orderId={job.orderId}
                      pdfCount={job.pdfCount || job.filesCount || job.fileCount || 0}
                      cost={job.amount ? `$${job.amount.toFixed(2)}` : (job.cost || '$0.00')}
                      username={job.username}
                      automationEnabled={automationEnabled}
                      onPrint={() => { }} // Required prop, but no-op in queue
                      queueNumber={index + 1}
                      showPrintButton={false}
                      priorityScore={calculatePriorityScore(job)}
                    />
                  </div>
                ))
              ) : (
                <div className="text-start py-6 text-gray-400">
                  No jobs in queue
                </div>
              )}
            </div>
          </div>

          {/* Printer Section - Scrollable Column */}
          <div className="flex flex-col h-full max-h-[calc(100vh-220px)] overflow-hidden">
            <div className="flex items-center justify-between mb-4 flex-shrink-0 px-1">
              <h3 className="text-md font-semibold">Printers</h3>
              <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm">
                <div className={`w-2 h-2 rounded-full ${onlinePrinterCount > 0 ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
                <span className="font-medium">{onlinePrinterCount}</span>
                <span className="text-gray-500 mx-1">/</span>
                <span>{printers.length}</span>
                <span className="ml-1 text-gray-500">online</span>
              </div>
            </div>
            <div className="overflow-y-auto flex-grow pr-2 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {/* Printer List */}
              <div className="space-y-2 mb-6">
                {printers.length > 0 ? (
                  printers.map((printer) => (
                    <PrinterCard
                      key={printer.id}
                      name={printer.name}
                      id={printer.id}
                      onStatusChange={handlePrinterStatusChange}
                      initialOnline={printer.online}
                    />
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    No printers found
                  </div>
                )}
              </div>

              {/* Printer stats */}
              {/* <div className="mt-6">
                <StatsCard 
                  title="Online Printers" 
                  value={`${onlinePrinterCount}/${printers.length}`} 
                  percentChange={printers.length === 0 ? 0 : Math.round((onlinePrinterCount / printers.length) * 100)} 
                  icon={<DollarSign className="w-5 h-5 text-primary" />} 
                />
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Status Dialog */}
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

      {/* Printer Selection Modal */}
      <Dialog open={showPrinterModal} onOpenChange={setShowPrinterModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Printer</DialogTitle>
            <DialogDescription>
              Choose an online printer to send this job to
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {onlinePrinters.length > 0 ? (
              <RadioGroup value={selectedPrinterId} onValueChange={setSelectedPrinterId}>
                {onlinePrinters.map((printer) => (
                  <div key={printer.id} className="flex items-center space-x-2 mb-2 p-2 border rounded-md hover:bg-gray-50">
                    <RadioGroupItem value={printer.id} id={`printer-${printer.id}`} />
                    <Label htmlFor={`printer-${printer.id}`} className="flex-1 cursor-pointer">
                      {printer.name}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="text-center py-6 text-amber-500">
                No online printers available. Please enable at least one printer.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrinterModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleManualPrint}
              disabled={!selectedPrinterId || onlinePrinters.length === 0}
            >
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;

