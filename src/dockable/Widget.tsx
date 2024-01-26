import React from 'react';

export type WidgetProps = {
  id?: string;
  title?: string;
  actions?: any[];
  minHeight?: number;
  children?: React.ReactNode;
};

// Not sure if I need a HOC anymore, so this is a wrapper component for widgets
export function Widget({
  children,
}: WidgetProps) {
  return <>{children}</>;
}
