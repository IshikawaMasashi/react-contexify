import React, {
  createElement,
  Children,
  cloneElement,
  isValidElement,
  ReactNode,
  SyntheticEvent,
  ReactElement
} from "react";
// import PropTypes from "prop-types";

import { DISPLAY_MENU } from "../utils/actions";
import { eventManager } from "../utils/eventManager";
import { MenuId, StyleProps } from "../types";

const { useRef } = React;
export interface MenuProviderProps extends StyleProps {
  /**
   * Unique id to identify the menu. Use to Trigger the corresponding menu
   */
  id: MenuId;

  /**
   * Any valid node that can be rendered
   */
  children: ReactNode;

  /**
   * Any valid node that can be rendered or a function returning a valid react node
   */
  component: ReactNode | ((args?: any) => ReactNode);

  /**
   * Render props
   */
  render?: (args?: any) => ReactNode;

  /**
   * Any react event
   * `onClick`, `onContextMenu`, ...
   */
  event: string;

  /**
   * Store children ref
   * `default: true`
   */
  storeRef: boolean;

  /**
   * Any valid object, data are passed to the menu item callback
   */
  data?: object;
}

export function MenuProvider(props: MenuProviderProps) {
  // static propTypes = {
  //   id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  //   children: PropTypes.node.isRequired,
  //   component: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  //   render: PropTypes.func,
  //   event: PropTypes.string,
  //   className: PropTypes.string,
  //   style: PropTypes.object,
  //   storeRef: PropTypes.bool,
  //   data: PropTypes.object
  // };

  const childrenRefs = useRef<HTMLElement[]>([]);

  const handleEvent = (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    eventManager.emit(DISPLAY_MENU(props.id), e.nativeEvent, {
      ref:
        childrenRefs.current.length === 1
          ? childrenRefs.current[0]
          : childrenRefs.current,
      ...props.data
    });
  };

  const setChildRef = (ref: HTMLElement) =>
    ref === null || childrenRefs.current.push(ref);

  const getChildren = () => {
    // remove all the props specific to the provider
    const {
      id,
      component,
      event,
      children,
      className,
      style,
      storeRef,
      data,
      ...rest
    } = props;

    // reset refs
    childrenRefs.current = [];

    return Children.map(children, child =>
      isValidElement(child)
        ? cloneElement(child as ReactElement<any>, {
            ...rest,
            ...(storeRef ? { ref: setChildRef } : {})
          })
        : child
    );
  };

  // const { component, render, event, className, style } = props;
  // const attributes = {
  //   [event]: handleEvent,
  //   className,
  //   style
  // };

  const render = () => {
    const { component, render, event, className, style } = props;
    const attributes = {
      [event]: handleEvent,
      className,
      style
    };

    if (typeof render === "function") {
      return render({ ...attributes, children: getChildren() });
    }

    return createElement(component as any, attributes, getChildren());
  };

  return render();
}

MenuProvider.defaultProps = {
  component: "div",
  event: "onContextMenu",
  storeRef: true
};

// export { MenuProvider };
