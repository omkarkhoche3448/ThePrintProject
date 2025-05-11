import React from 'react';
import { CheckCircle, Download, Info } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { PrintJob } from '../../types';

interface CompletedJobsListProps {
  jobs: PrintJob[];
}

const CompletedJobsList: React.FC<CompletedJobsListProps> = ({ jobs }) => {
  // Sort completed jobs by completion date (most recent first)
  const sortedJobs = [...jobs].sort((a, b) => {
    if (!a.completedAt || !b.completedAt) return 0;
    return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
  });

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString();
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price?: number) => {
    if (price === undefined) return 'N/A';
    return `$${price.toFixed(2)}`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-xerox-gray-900 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-xerox-green-500" />
          Completed Jobs
        </h2>
        <Badge variant="success" className="px-3 py-1">
          {sortedJobs.length} Jobs
        </Badge>
      </div>
      
      <div className="overflow-y-auto flex-grow">
        {sortedJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full bg-xerox-gray-50 rounded-lg p-6 text-center">
            <CheckCircle className="w-12 h-12 text-xerox-gray-400 mb-2" />
            <p className="text-xerox-gray-500">No completed jobs to display</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-medium">{job.filename}</CardTitle>
                    <Badge variant="success">Completed</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <div className="text-xerox-gray-500">Order ID:</div>
                      <div className="font-medium">{job.id}</div>
                    </div>
                    <div>
                      <div className="text-xerox-gray-500">Price:</div>
                      <div className="font-medium">{formatPrice(job.price)}</div>
                    </div>
                    <div>
                      <div className="text-xerox-gray-500">Completed:</div>
                      <div>{job.completedAt ? `${formatDate(job.completedAt)} at ${formatTime(job.completedAt)}` : 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xerox-gray-500">Pages × Copies:</div>
                      <div>{job.pages} × {job.copies}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Button size="sm" variant="outline" className="text-xs">
                      <Info className="w-3 h-3 mr-1" />
                      Details
                    </Button>
                    <Button size="sm" className="text-xs">
                      <Download className="w-3 h-3 mr-1" />
                      Receipt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedJobsList;