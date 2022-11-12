import React from 'react';

// Not sure if I need a HOC anymore, so this is a wrapper component for widgets
export function Widget({
  id,
  title = id,
  actions = undefined,
  minHeight = 100,
  children,
}) {
  return <>{children}</>;
}
