/* global: window */
import React, { ReactNode } from "react";
import cx from "classnames";

import { cloneItem } from "./cloneItem";
import { Portal } from "./Portal";

import { HIDE_ALL, DISPLAY_MENU } from "../utils/actions";
import { styles } from "../utils/styles";
import { eventManager } from "../utils/eventManager";
import { TriggerEvent, StyleProps, MenuId } from "../types";

const KEY = {
  ENTER: 13,
  ESC: 27,
  ARROW_UP: 38,
  ARROW_DOWN: 40,
  ARROW_LEFT: 37,
  ARROW_RIGHT: 39
};

export interface MenuProps extends StyleProps {
  /**
   * Unique id to identify the menu. Use to Trigger the corresponding menu
   */
  id: MenuId;

  /**
   * Any valid node that can be rendered
   */
  children: ReactNode;

  /**
   * Theme is appended to `react-contexify__theme--${given theme}`.
   *
   * Built-in theme are `light` and `dark`
   */
  theme?: string;

  /**
   * Animation is appended to `.react-contexify__will-enter--${given animation}`
   *
   * Built-in animations are fade, flip, pop, zoom
   */
  animation?: string;

  /**
   * Invoked when the menu is shown.
   */
  onShown?: () => void;

  /**
   * Invoked when the menu is hidden.
   */
  onHidden?: () => void;
}

// interface MenuState {
//   x: number;
//   y: number;
//   visible: boolean;
//   nativeEvent: TriggerEvent;
//   propsFromTrigger: object;
// }

const { useState, useRef, useEffect } = React;
function Menu({
  animation,
  children,
  className,
  id,
  onHidden,
  onShown,
  style,
  theme
}: MenuProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [nativeEvent, setNativeEvent] = useState({} as TriggerEvent);
  const [propsFromTrigger, setPropsFromTrigger] = useState({});
  // const [state, setState] = useState({
  //   onShown: null,
  //   onHidden: null
  // });

  const menuRef = useRef<HTMLDivElement>(null);
  const unsubRef = useRef<(() => boolean)[]>([]);

  useEffect(() => {
    unsubRef.current.push(eventManager.on(DISPLAY_MENU(id), show));
    unsubRef.current.push(eventManager.on(HIDE_ALL, hide));
    return () => {
      unsubRef.current.forEach(cb => cb());
      unBindWindowEvent();
    };
  }, []);

  useEffect(() => {
    if (visible) {
      bindWindowEvent();
      if (onShown) {
        onShown();
      }
      return;
    }

    unBindWindowEvent();
    if (onHidden) {
      onHidden();
    }
  }, [visible]);

  const bindWindowEvent = () => {
    window.addEventListener("resize", hide);
    window.addEventListener("contextmenu", hide);
    window.addEventListener("mousedown", hide);
    window.addEventListener("click", hide);
    window.addEventListener("scroll", hide);
    window.addEventListener("keydown", handleKeyboard);
  };

  const unBindWindowEvent = () => {
    window.removeEventListener("resize", hide);
    window.removeEventListener("contextmenu", hide);
    window.removeEventListener("mousedown", hide);
    window.removeEventListener("click", hide);
    window.removeEventListener("scroll", hide);
    window.removeEventListener("keydown", handleKeyboard);
  };

  const onMouseEnter = () => window.removeEventListener("mousedown", hide);

  const onMouseLeave = () => window.addEventListener("mousedown", hide);

  const hide = (event?: Event) => {
    // Safari trigger a click event when you ctrl + trackpad
    // Firefox:  trigger a click event when right click occur
    const e = event as KeyboardEvent & MouseEvent;

    if (
      typeof e !== "undefined" &&
      (e.button === 2 || e.ctrlKey === true) &&
      e.type !== "contextmenu"
    ) {
      unBindWindowEvent();
      setVisible(false);
      return;
    }

    unBindWindowEvent();
    // setState({ ...state, visible: false });
    setVisible(false);
  };

  const handleKeyboard = (e: KeyboardEvent) => {
    if (e.keyCode === KEY.ENTER || e.keyCode === KEY.ESC) {
      unBindWindowEvent();
      // setState({ ...state, visible: false });
      setVisible(false);
    }
  };

  // const setRef = (ref: HTMLDivElement) => {
  //   menuRef = ref;
  // };

  const setMenuPosition = () => {
    // if (menuRef.current) {
    //   const { innerWidth: windowWidth, innerHeight: windowHeight } = window;
    //   const {
    //     offsetWidth: menuWidth,
    //     offsetHeight: menuHeight
    //   } = menuRef.current;
    //   let { x, y } = position;
    //   if (x + menuWidth > windowWidth) {
    //     x -= x + menuWidth - windowWidth;
    //   }
    //   if (y + menuHeight > windowHeight) {
    //     y -= y + menuHeight - windowHeight;
    //   }
    //   setPosition({ x, y });
    // }
  };

  const getMousePosition = (e: TriggerEvent) => {
    const pos = {
      x: e.clientX,
      y: e.clientY
    };

    if (
      e.type === "touchend" &&
      (!pos.x || !pos.y) &&
      (e.changedTouches && e.changedTouches.length > 0)
    ) {
      pos.x = e.changedTouches[0].clientX;
      pos.y = e.changedTouches[0].clientY;
    }

    if (!pos.x || pos.x < 0) {
      pos.x = 0;
    }

    if (!pos.y || pos.y < 0) {
      pos.y = 0;
    }

    return pos;
  };

  const show = (e: TriggerEvent, props: object) => {
    e.stopPropagation();
    eventManager.emit(HIDE_ALL);

    if ((props as any).position) {
      const { x, y } = (props as any).position;

      setVisible(true);
      setPosition({ x, y });
      setNativeEvent(e);
      setPropsFromTrigger(props);
      // setState({
      //   ...state,
      // });
      setMenuPosition();
      return;
    }

    const { x, y } = getMousePosition(e);

    setVisible(true);
    setPosition({ x, y });
    setNativeEvent(e);
    setPropsFromTrigger(props);
    // setState({
    //   ...state,
    // });
    setMenuPosition();
  };

  // const { propsFromTrigger } = state;

  const { x, y } = position;
  const cssClasses = cx(styles.menu, className, {
    [styles.theme + theme]: theme,
    [styles.animationWillEnter + animation]: animation
  });
  const menuStyle = {
    ...style,
    left: x,
    top: y + 1,
    opacity: 1
  };

  return (
    <Portal>
      {visible && (
        <div
          className={cssClasses}
          style={menuStyle}
          ref={menuRef}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div>
            {cloneItem(children, {
              nativeEvent,
              propsFromTrigger
            })}
          </div>
        </div>
      )}
    </Portal>
  );
}

export { Menu };
