import React, { useEffect, useRef, useState } from 'react';
import css from './css/ContextMenu.module.css';

// TODO:
// handle bool is unused or unfinished

export type Actions = (ActionGroup | BoolGroup | EnumGroup)[];

type ActionGroup = {
  type: 'actions';
  actions: {
    [key: string]: () => void;
  };
};

type BoolGroup = {
  type: 'bools';
  options: {
    [key: string]: {
      function: () => void;
      value: boolean;
    };
  };
};

type EnumGroup = {
  type: 'enum';
  options: string[];
  onChange: (index: number) => {};
  selected: number;
};

type PropTypes = {
  left: any;
  top: any;
  actions: Actions;
  onClickOut: () => void;
};

function ContextMenu({ left, top, actions, onClickOut }: PropTypes) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let [x, y] = [0, 0];
    let menuBox = containerRef.current.getBoundingClientRect();
    let viewPort = { width: window.innerWidth, height: window.innerHeight };

    if (left + menuBox.width > viewPort.width) {
      x -= left + menuBox.width - viewPort.width;
    }
    if (top + menuBox.height > viewPort.height) {
      y -= top + menuBox.height - viewPort.height;
    }

    setOffset({ x, y });
  }, [containerRef, left, top]);

  function handleClickOut() {
    onClickOut();
  }

  function handleAction(action: () => void) {
    action();
    onClickOut();
  }

  function handleSelection(callback: (i: number) => void, i: number) {
    callback(i);
    onClickOut();
  }

  // function handleBool(toggleFunction: () => void) {
  //   toggleFunction();
  //   onClickOut();
  // }

  return (
    <div className={css.container} onClick={handleClickOut}>
      <div
        style={{
          left: left + offset.x,
          top: top + offset.y,
        }}
        className={css.contextMenu}
        ref={containerRef}
      >
        {actions.map((actionGroup, i, arr) => {
          const types = {
            actions: () => {
              const group = actionGroup as ActionGroup;
              return Object.keys(group.actions).map((action, a) => (
                <div
                  key={a}
                  className={css.contextMenuItem}
                  onClick={handleAction.bind(null, group.actions[action])}
                >
                  <div>{action}</div>
                  <div style={{ marginLeft: 16, color: '#666' }}>Ctrl+Z</div>
                </div>
              ));
            },

            enum: () => {
              const group = actionGroup as EnumGroup;
              return group.options.map((action, a) => (
                <div
                  key={a}
                  className={css.contextMenuItem}
                  onClick={handleSelection.bind(null, group.onChange, a)}
                >
                  <div className={css.radio}>
                    {group.selected === a ? '⚫' : '⚪'}
                  </div>
                  <span>{action}</span>
                </div>
              ));
            },

            bools: () => {
              const group = actionGroup as BoolGroup;
              return Object.keys(group.options).map((option, a) => (
                <div
                  key={a}
                  className={css.contextMenuItem}
                  onClick={handleAction.bind(
                    null,
                    group.options[option].function
                  )}
                >
                  <div className={css.checkbox}>
                    {group.options[option].value === true ? '✔' : ' '}
                  </div>
                  <span>{option}</span>
                </div>
              ));
            },
          };

          return (
            <React.Fragment key={i}>
              {types[actionGroup.type]()}
              {i !== arr.length - 1 ? (
                <div className={css.contextMenuDivider} />
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default ContextMenu;
