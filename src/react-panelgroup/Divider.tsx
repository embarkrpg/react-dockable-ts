import React from 'react';

export type DividerProps = {
  size?: number;
  bleed?: number;
  color?: string;
  onDragStart?: (event: React.PointerEvent<HTMLDivElement>) => void;
  direction?: 'row' | 'column';
  className?: string;
};

function Divider({
  size = 1,
  bleed = 4,
  color = 'transparent',
  onDragStart,
  direction,
  className,
}: DividerProps) {
  function getCursor() {
    return direction === 'row' ? 'ew-resize' : 'ns-resize';
  }

  function getPropertyName(type: string, inverse: boolean = false) : string {
    let isRow = direction === 'row';
    if (inverse) isRow = !isRow;

    switch (type) {
      case 'size':
        return isRow ? 'width' : 'height';
      case 'position':
        return isRow ? 'left' : 'top';
      default:
        throw new Error('Invalid property name: ' + type);
    }
  }

  return (
    <div
      className={`pg-divider ${className || ''}`}
      style={{
        [getPropertyName('size')]: size,
        backgroundColor: color,
        userSelect: 'none',
        flexShrink: 0,
        position: 'relative',
      }}
      onPointerDown={onDragStart}
    >
      <div
        className={'pg-handle'}
        style={{
          [getPropertyName('size')]: size + bleed * 2,
          [getPropertyName('position')]: -bleed,
          cursor: getCursor(),
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      ></div>
    </div>
  );
}

export default Divider;
