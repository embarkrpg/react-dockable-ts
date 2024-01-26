import React, { forwardRef } from "react";

export type PanelProps = {
  className?: string;
  color?: string;
  data: any;
  direction?: "row" | "column";
  children?: JSX.Element | JSX.Element[];
}

const Panel = forwardRef(function (
  { className, color, data, direction, children }: PanelProps,
  ref
) {
  function getPropertyName(type: string, inverse: boolean = false) {
    let isRow = direction === "row";
    if (inverse) isRow = !isRow;

    switch (type) {
      case "size":
        return isRow ? "width" : "height";
      case "minSize":
        return isRow ? "minWidth" : "minHeight";
      case "maxSize":
        return isRow ? "maxWidth" : "maxHeight";
      default:
        throw new Error("Invalid type");
    }
  }

  return (
    <div
      className={`pg-panel ${className || ""}`}
      // @ts-ignore
      ref={ref}
      style={{
        [getPropertyName("size")]: data.size,
        [getPropertyName("minSize")]: data.minSize,
        [getPropertyName("maxSize")]: data.maxSize || "auto",
        flexGrow: !data.maxSize && data.resize === "stretch" ? "1" : "0",
        backgroundColor: color,
        userSelect: "none",
        display: "flex",
      }}
    >
      {children}
    </div>
  );
});

export default Panel;
