import React, { useRef } from "react";
import PanelGroup from "../react-panelgroup";
import Window from "./Window";
import { Widget } from "./Widget";

import css from "./css/WindowPanel.module.css";
import { HoverBorder } from "./Dockable";
export type WindowPanelProps = {
  index: number;
  isLast: boolean;
  draggingTab: boolean;
  hoverBorder: HoverBorder;
  onHoverBorder: (index: HoverBorder) => void;
  windows: any[];
  onTabSort: (
    panelIndex: number,
    windowIndex: number,
    tabStart: number,
    tabEnd: number
  ) => void;
  onTabSelect: (
    panelId: number,
    windowId: number,
    tabId: number,
    componentId: string
  ) => void;
  onContextClick: (actions: any[], x: number, y: number) => void;
  widgets?: JSX.Element | JSX.Element[];
  onUpdate: (panelId: number, windows: any[]) => void;
  onTabClosed: (panelId: number, windowId: number, tabId: number) => void;
  onWindowClosed: (panelId: number, windowId: number) => void;
  spacing?: number;
  hideMenus?: boolean;
  hideTabs?: boolean;
  active?: string;
  onActive: (id: string) => void;
  tabHeight?: number;
  hidden?: any;
};


function WindowPanel({
  index,
  isLast,
  draggingTab,
  hoverBorder,
  onHoverBorder,
  windows,
  onTabSort,
  onTabSelect,
  onContextClick,
  widgets,
  onUpdate,
  onTabClosed,
  onWindowClosed,
  spacing,
  hideMenus,
  hideTabs,
  active,
  onActive,
  tabHeight,
  hidden,
}: WindowPanelProps) {
  const containerRef = useRef<HTMLDivElement>()
  // let windowRefs = [];

  function handleTabSwitch(i, size) {
    // exit early if size didn't change
    if (windows[i].minSize === size) return;

    let newPanels = windows.slice();
    newPanels[i].minSize = size;
    if (newPanels[i].size < newPanels[i].minSize) {
      newPanels[i].size = newPanels[i].minSize;
    }

    handleResize(newPanels);
  }

  function handleResize(windows) {
    onUpdate(index, windows);
  }

  function renderBorders() {
    if (!containerRef.current) return undefined;
    const rect = containerRef.current.getBoundingClientRect();

    return [
      draggingTab && (
        <div
          key={0}
          className={css.dropBorder}
          onMouseOver={onHoverBorder.bind(this, [index, null])}
          onMouseOut={onHoverBorder.bind(this, null)}
          style={{
            height: rect.height,
            top: rect.top,
            left: rect.left - 9,
          }}
        />
      ),
      draggingTab && isLast && (
        <div
          key={1}
          className={css.dropBorder}
          onMouseOver={onHoverBorder.bind(this, [index + 1, null])}
          onMouseOut={onHoverBorder.bind(this, null)}
          style={{
            height: rect.height,
            top: rect.top,
            left: rect.left + rect.width - 6,
          }}
        />
      ),
    ];
  }

  function filterVisibleWidgets(thisWindow: { widgets: any[]; }) {
    return thisWindow.widgets.filter(
      (widget) => {
        if (!getWidgetComponent(widget)) {
          console.warn(`Widget ${widget} not found. keeping it hidden`);
        }
        // @ts-ignore
        return !(getWidgetComponent(widget)?.props.hidden || hidden[widget])
      }
    );
  }

  function getFilteredWindows() {
    if (!hidden) return windows;

    return windows.filter((windows) => {
      return (
        windows.widgets.filter((widget) => {
          return !hidden[widget];
        }).length > 0
      );
    });
  }

  function getWidgetComponent(id) {
    return React.Children.toArray(widgets).find(
      // @ts-ignore
      (child) => child.props.id === id
    );
  }

  return (
    <div className={css.container} ref={containerRef}>
      <PanelGroup
        direction={"column"}
        spacing={spacing || 0}
        borderColor={"transparent"}
        panelWidths={getFilteredWindows()}
        // onUpdate={panels => setState({ panelWidths: panels.slice() })}
        onUpdate={handleResize}
      >
        {getFilteredWindows().map((thisWindow, windowIndex) => {
          const filteredWidgets = filterVisibleWidgets(thisWindow);
          return filteredWidgets.length ? (
            <Window
              key={windowIndex}
              index={windowIndex}
              active={active}
              onActive={onActive}
              windowId={`${index},${windowIndex}`}
              onContextClick={onContextClick}
              isLast={windowIndex === windows.length - 1}
              draggingTab={draggingTab}
              hoverBorder={hoverBorder}
              onHoverBorder={(i) => {
                onHoverBorder(i === null ? null : [index, i]);
              }}
              onSort={onTabSort.bind(this, index, windowIndex)}
              selected={Math.min(
                thisWindow.selected,
                filteredWidgets.length - 1
              )}
              onTabSelect={(i, componentId) => {
                onTabSelect(index, windowIndex, i, componentId);
              }}
              // ref={(input) => {
              //   windowRefs[windowIndex] = input;
              // }}
              onTabSwitch={handleTabSwitch.bind(null, windowIndex)}
              onTabClosed={(winId, tabId) => {
                var [panelId, windowId] = winId.split(",");
                onTabClosed(
                  parseInt(panelId, 10),
                  parseInt(windowId, 10),
                  tabId
                );
              }}
              onWindowClosed={(winId) => {
                var [panelId, windowId] = winId.split(",");
                onWindowClosed(parseInt(panelId, 10), parseInt(windowId, 10));
              }}
              hideTabs={thisWindow.hideTabs || hideTabs}
              hideMenu={hideMenus}
              style={thisWindow.style}
              tabHeight={tabHeight}
            >
              {filteredWidgets.map((widget, i) => {
                // Find component with the desired name
                let Component = getWidgetComponent(widget);
                if (!Component) Component = <Widget title="Missing Widget" />;
                return Component;
              })}
            </Window>
          ) : null;
        })}
      </PanelGroup>
      {renderBorders()}
    </div>
  );
}

export default WindowPanel;
