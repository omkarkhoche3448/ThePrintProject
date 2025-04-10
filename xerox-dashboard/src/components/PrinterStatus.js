import React from 'react';

const PrinterStatus = ({ printers, queue, onAssignJob }) => {
  return (
    <div className="printer-status">
      {printers.map(printer => (
        <div 
          key={printer.id} 
          className={`printer-card ${printer.status}`}
          onClick={() => {
            if (printer.status === 'available' && queue.length > 0) {
              onAssignJob(0, printer.id);
            }
          }}
        >
          <h3>{printer.name}</h3>
          <div className="status-indicator">
            {printer.status === 'available' 
              ? 'Available' 
              : `Busy - Job #${printer.currentJob}`}
          </div>
          {printer.status === 'available' && queue.length > 0 ? (
            <div className="printer-action">Click to assign next job</div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default PrinterStatus;