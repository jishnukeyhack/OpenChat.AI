"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const ORIENTATIONS = ["horizontal", "vertical"] as const;
type Orientation = (typeof ORIENTATIONS)[number];

interface ResizablePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The children of the panel.
   */
  children: React.ReactNode;
  /**
   * The default size of the panel, as a percentage of the parent.
   */
  defaultSize?: number;
}

const ResizablePanel = React.forwardRef<HTMLDivElement, ResizablePanelProps>(
  ({ className, children, defaultSize = 50, ...props }, ref) => {
    const [size, setSize] = useState(defaultSize);

    return (
      <div
        ref={ref}
        className={cn("flex-1 overflow-hidden", className)}
        style={{ flexBasis: `${size}%` }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ResizablePanel.displayName = "ResizablePanel";

interface ResizableHandleProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The orientation of the handle.
   */
  orientation: Orientation;
}

const ResizableHandle = React.forwardRef<HTMLDivElement, ResizableHandleProps>(
  ({ className, orientation, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-border cursor-ew-resize",
          orientation === "horizontal" ? "h-full w-2" : "w-full h-2",
          className
        )}
        {...props}
      />
    );
  }
);

ResizableHandle.displayName = "ResizableHandle";

interface ResizablePanelGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The children of the panel group.
   */
  children: React.ReactNode;
  /**
   * The orientation of the panel group.
   */
  orientation: Orientation;
}

const ResizablePanelGroup = React.forwardRef<
  HTMLDivElement,
  ResizablePanelGroupProps
>(({ className, children, orientation = "horizontal", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex",
        orientation === "horizontal" ? "flex-row" : "flex-col",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

ResizablePanelGroup.displayName = "ResizablePanelGroup";

export { ResizablePanel, ResizableHandle, ResizablePanelGroup };
