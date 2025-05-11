import React from 'react';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels';

function ResizableLayout({ children, defaultSizes = [33, 34, 33] }) {
  return (
    <PanelGroup direction="horizontal" className="h-full">
      <Panel defaultSize={defaultSizes[0]} minSize={20} className="h-full">
        <div className="h-full p-4">
          {children[0]}
        </div>
      </Panel>
      
      <PanelResizeHandle className="w-1 bg-xerox-gray-200 hover:bg-xerox-red transition-colors duration-200 relative">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-16 rounded bg-xerox-gray-300"></div>
      </PanelResizeHandle>
      
      <Panel defaultSize={defaultSizes[1]} minSize={20} className="h-full">
        <div className="h-full p-4">
          {children[1]}
        </div>
      </Panel>
      
      <PanelResizeHandle className="w-1 bg-xerox-gray-200 hover:bg-xerox-red transition-colors duration-200 relative">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-16 rounded bg-xerox-gray-300"></div>
      </PanelResizeHandle>
      
      <Panel defaultSize={defaultSizes[2]} minSize={20} className="h-full">
        <div className="h-full p-4">
          {children[2]}
        </div>
      </Panel>
    </PanelGroup>
  );
}

export default ResizableLayout;