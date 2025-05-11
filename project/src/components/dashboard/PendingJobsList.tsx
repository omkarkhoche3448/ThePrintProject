import React from 'react';
import { Clock, AlertTriangle, Printer, FileText } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { PrintJob } from '../../types';

interface PendingJobsListProps {
  jobs: PrintJob[];
}

const PendingJobsList: React.FC<PendingJobsListProps> = ({ jobs }) => {
  // Sort jobs by priority
  const sortedJobs = [...jobs].sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="danger" className="animate-pulse-slow">Urgent</Badge>;
      case 'high':
        return <Badge variant="warning">High</Badge>;
      case 'normal':
        return <Badge variant="primary">Normal</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-xerox-gray-900 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-xerox-red" />
          Pending Jobs
        </h2>
        <Badge variant="primary" className="px-3 py-1">
          {sortedJobs.length} Jobs
        </Badge>
      </div>
      
      <div className="overflow-y-auto flex-grow">
        {sortedJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full bg-xerox-gray-50 rounded-lg p-6 text-center">
            <FileText className="w-12 h-12 text-xerox-gray-400 mb-2" />
            <p className="text-xerox-gray-500">No pending jobs at the moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-medium">{job.filename}</CardTitle>
                    {getPriorityBadge(job.priority)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-xerox-gray-500 mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        {job.pages} pages × {job.copies} {job.copies > 1 ? 'copies' : 'copy'}
                      </div>
                      <div className="text-xs">
                        Submitted at {formatTime(job.submitted)}
                      </div>
                    </div>
                    <div className="text-xs truncate">
                      From: {job.userEmail}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Button size="sm" variant="outline" className="text-xs">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Report Issue
                    </Button>
                    <Button size="sm" className="text-xs">
                      <Printer className="w-3 h-3 mr-1" />
                      Print Now
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

export default PendingJobsList;