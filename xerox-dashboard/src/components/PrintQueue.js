import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const PrintQueue = ({ queue, updateQueue }) => {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(queue);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    updateQueue(items);
  };
  
  return (
    <div className="print-queue">
      {queue.length === 0 ? (
        <div className="empty-queue">No jobs in queue</div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <ul
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="queue-list"
              >
                {queue.map((job, index) => (
                  <Draggable key={`${job.id}-${index}`} draggableId={`${job.id}-${index}`} index={index}>
                    {(provided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="queue-item"
                      >
                        <div className="job-header">
                          <span className="job-id">Job #{job.id}</span>
                          <span className={`job-status ${job.status}`}>{job.status}</span>
                        </div>
                        <div className="job-details">
                          <div><strong>File:</strong> {job.fileName}</div>
                          <div><strong>Pages:</strong> {job.pageCount}</div>
                          <div><strong>Type:</strong> {job.colorMode}</div>
                        </div>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};

export default PrintQueue;