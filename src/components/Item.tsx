import React, { ReactNode } from "react";
// import PropTypes from 'prop-types';
import cx from "classnames";

import { styles } from "../utils/styles";
import {
  MenuItemEventHandler,
  TriggerEvent,
  StyleProps,
  InternalProps
} from "../types";

export interface ItemProps extends StyleProps, InternalProps {
  /**
   * Any valid node that can be rendered
   */
  children: ReactNode;

  /**
   * Passed to the `Item` onClick callback. Accessible via `props`
   */
  data?: object;

  /**
   * Disable or not the `Item`. If a function is used, a boolean must be returned
   */
  disabled: boolean | ((args: MenuItemEventHandler) => boolean);

  /**
   * Callback when the current `Item` is clicked. The callback give you access to the current event and also the data passed
   * to the `Item`.
   * `({ event, props }) => ...`
   */
  onClick: (args: MenuItemEventHandler) => any;
}

const noop = () => {};

export function Item({
  disabled = false,
  onClick = noop,
  nativeEvent,
  propsFromTrigger,
  data,
  className,
  style,
  children
}: ItemProps) {
  // static propTypes = {
  //   children: PropTypes.node.isRequired,
  //   data: PropTypes.object,
  //   disabled: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  //   onClick: PropTypes.func,
  //   nativeEvent: PropTypes.object,
  //   propsFromTrigger: PropTypes.object,
  //   className: PropTypes.string,
  //   style: PropTypes.object
  // };

  // static defaultProps = {
  //   disabled: false,
  //   onClick: noop
  // };

  let isDisabled =
    typeof disabled === "function"
      ? disabled({
          event: nativeEvent as TriggerEvent,
          props: { ...propsFromTrigger, ...data }
        })
      : disabled;

  // constructor(props: ItemProps) {
  // super(props);
  // const { disabled, nativeEvent, propsFromTrigger, data } = this.props;

  //   this.isDisabled =
  //     typeof disabled === 'function'
  //       ? disabled({
  //           event: nativeEvent as TriggerEvent,
  //           props: { ...propsFromTrigger, ...data }
  //         })
  //       : disabled;
  // }

  const handleClick = (e: React.MouseEvent) => {
    isDisabled
      ? e.stopPropagation()
      : onClick({
          event: nativeEvent as TriggerEvent,
          props: { ...propsFromTrigger, ...data }
        });
  };

  // return {
  // const { className, style, children } = this.props;

  const cssClasses = cx(styles.item, className, {
    [`${styles.itemDisabled}`]: isDisabled
  });

  return (
    <div
      className={cssClasses}
      style={style}
      onClick={handleClick}
      role="presentation"
    >
      <div className={styles.itemContent}>{children}</div>
    </div>
  );
}

// export { Item };
