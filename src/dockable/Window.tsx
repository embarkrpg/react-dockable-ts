import React, { MouseEventHandler, useEffect, useRef } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';

import css from './css/Window.module.css';
// import Color from "color";

export type WindowProps = {
  index: number;
  active: string;
  windowId: string;
  isLast: boolean;
  draggingTab: boolean;
  hoverBorder: [number, number];
  selected: number;
  hideTabs: boolean;
  hideMenu: boolean;
  tabHeight: number;
  style: any;
  onSort: (windowId: string, from: number, to: number) => void;
  onActive: (id: string) => void;
  onContextClick: (actions: any[], x: number, y: number) => void;
  onHoverBorder: (index: number) => void;
  onTabSelect: (tabId: number, componentId: string) => void;
  onTabSwitch: (size: number) => void;
  onTabClosed: (windowId: string, tabId?: number) => void;
  onWindowClosed: (windowId: string) => void;
  children: React.ReactNode[]
};

function Window({
  index,
  active,
  windowId,
  isLast,
  draggingTab,
  hoverBorder,
  selected,
  hideTabs,
  hideMenu,
  tabHeight,
  style,
  onSort,
  onActive,
  onContextClick,
  onHoverBorder,
  onTabSelect,
  onTabSwitch,
  onTabClosed,
  onWindowClosed,
  children,
}: WindowProps) {
  const widgetRef = useRef();
  const containerRef = useRef();

  // When tab has been switched, report the minsize of the new widget
  useEffect(() => {
    function getSize(tab: number) {
      let widget = React.Children.toArray(children)[
        tab == undefined ? selected : tab
      ];

      // @ts-ignore
      let size = widget.props.minHeight ? widget.props.minHeight : 0;
      return size + 34; // content size + tab bar
    }
    onTabSwitch(getSize(selected));
  }, [selected, children]);

  function handleContextClick(e) {
    let ref = GetSelectedWidget();
    let clientRect = e.target.getBoundingClientRect();

    onContextClick(
      getActions(ref),
      clientRect.left,
      clientRect.top + clientRect.height
    );
  }

  function getActions(ref, includeDefault = true) {
    const actions = [];

    if (includeDefault)
      actions.push({
        type: 'actions',
        actions: {
          'Close Tab': () => {
            onTabClosed(windowId, selected);
          },
          'Close Tab Group': () => {
            onWindowClosed(windowId);
          },
        },
      });

    return ref.props.actions
      ? ref.props.actions.call(ref, ref).concat(actions)
      : actions;
  }

  function renderBorders() {
    if (!containerRef.current) return undefined;

    // @ts-ignore
    const rect = containerRef.current.getBoundingClientRect();

    return [
      draggingTab && (
        <div
          key={0}
          className={css.dropBorder}
          onMouseOver={() => onHoverBorder(index)}
          onMouseOut={() => onHoverBorder(null)}
          style={{
            width: rect.width,
            top: rect.top - 9,
            left: rect.left,
          }}
        />
      ),
      draggingTab && isLast && (
        <div
          key={1}
          className={css.dropBorder}
          onMouseOver={() => onHoverBorder(index + 1)}
          onMouseOut={() => onHoverBorder(null)}
          style={{
            width: rect.width,
            top: rect.top + rect.height - 9,
            left: rect.left,
          }}
        />
      ),
    ];
  }

  function GetSelectedWidget() {
    return React.Children.toArray(children)[selected];
  }

  return (
    <div
      className={css.container}
      ref={containerRef}
      onMouseDown={() =>
        // @ts-ignore
        onActive(React.Children.toArray(children)[selected].props.id)
      }
    >
      <div className={css.window} style={style}>
        {!hideTabs && (
          <TabBar
            active={active}
            widgets={children}
            selected={selected}
            onTabClick={(tabId, componentId) => {
              onTabSelect(tabId, componentId);
            }}
            onContextClick={handleContextClick}
            onSort={onSort}
            windowId={windowId}
            hoverBorder={hoverBorder}
            onClose={onTabClosed}
            hideMenu={
              // hide the context menu if there aren't any actions to show
              hideMenu || !getActions(GetSelectedWidget()).length
            }
            tabHeight={tabHeight}
          />
        )}

        <div className={css.content}>{GetSelectedWidget()}</div>
      </div>
      {renderBorders()}
    </div>
  );
}

export type TabBarProps = {
  active: string;
  widgets: React.ReactNode[];
  selected: number;
  onTabClick: (tabId: number, componentId: string) => void;
  onContextClick: MouseEventHandler<HTMLDivElement>;
  onSort: (windowId: string, from: number, to: number) => void;
  windowId: string;
  hoverBorder: [number, number];
  onClose: (windowId: string, tabId?: number) => void;
  hideMenu: boolean;
  tabHeight: number;
};

function TabBar({
  active,
  widgets,
  selected,
  onTabClick,
  onContextClick,
  onSort,
  windowId,
  hoverBorder,
  onClose,
  hideMenu,
  tabHeight,
}: TabBarProps) {
  function getStyle(style, snapshot) {
    if (!snapshot.isDropAnimating) {
      return style;
    }
    const { curve, duration } = snapshot.dropAnimation;
    return {
      ...style,
      // cannot be 0, but make it super tiny
      transition: `all ${curve} ${snapshot.isDropAnimating ? 0.001 : duration
        }s`,
      // boxShadow: snapshot.isDragging
      //   ? "0 1px 10px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.25)"
      //   : `1px -1px 0 #353535, -1px -1px 0 #353535`,
      borderRadius: snapshot.isDragging ? 1 : 0,
    };
  }

  return (
    <Droppable droppableId={windowId} type="dockable-tab" direction="horizontal">
      {(provided, snapshot) => (
        <div
          className={`${css.tabBar} ${snapshot.isDraggingOver &&
            !snapshot.draggingFromThisWith &&
            !hoverBorder
            ? css.tabBarHover
            : ''
            }`}
          style={tabHeight ? { height: tabHeight } : {}}
        >
          {/* <div className={css.tabSpacer}> */}
          <div
            ref={provided.innerRef}
            className={css.tabSpacer}
            {...provided.droppableProps}
          >
            {widgets.map((child: any, i) => {
              if (child.props.TabContainerComponent) {
                var TabContainer = child.props.TabContainerComponent;
                var maybeCloseTab = {
                  closeTab: () => {
                    if (child.props.onClose)
                      child.props.onClose(child.props.id);
                    onClose(windowId, i);
                  }
                }
              }
              else {
                TabContainer = 'div'
                maybeCloseTab = {} as any
              }

              return <Draggable
                key={`${windowId},${i}`}
                draggableId={`${windowId},${i}`}
                index={i}
              >
                {(provided, snapshot) => (
                  <TabContainer
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    key={i}
                    className={`${css.tab} ${i === selected ? css.active : ''}`}
                    {...maybeCloseTab}
                    onMouseDown={e => {
                      onTabClick(i, child.props.id);
                      e.stopPropagation();
                    }}
                    style={getStyle(provided.draggableProps.style, snapshot)}
                  >
                    <span
                      className={css.title}
                      style={{
                        fontWeight:
                          i === selected && child.props.id === active
                            ? 'bold'
                            : 'normal',
                      }}
                    >
                      {child.props.title || child.props.id}
                    </span>

                    {/* {!hideMenu && (
                                <div
                                  className={css.burgerMenuContainer}
                                  onClick={onContextClick}
                                  style={
                                    {
                                      width: i === selected && !snapshot.isDragging ? 32 : 0
                                    }
                                  }
                                >
                                  <div className={css.burgerMenu} />
                                </div>
                              )} */}

                    {child.props.closeable ? (
                      <div
                        className={css.closeBox}
                        onClick={maybeCloseTab.closeTab}
                      />
                    ) : null}
                  </TabContainer>
                )}
              </Draggable>
            })}
            {provided.placeholder}
          </div>
          {/* </div> */}
          {/* <div className={css.tabSpacer} /> */}
          {!hideMenu && (
            <div className={css.burgerMenuContainer} onClick={onContextClick}>
              <div className={css.burgerMenu} />
            </div>
          )}
        </div>
      )}
    </Droppable>
  );
}

export default Window;
