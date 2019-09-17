import { useRef } from "react";
import { getCoords } from "./helpers";

const MOUSE_BUTTON = {
  LEFT: 0,
  RIGHT: 2
};

export type Config = {
  disable: boolean;
  holdToDisplay: number;
  posX: number;
  posY: number;
  mouseButton: number;
  disableIfShiftIsPressed: boolean;
  collect: () => string;
};
const defaultConfig: Config = {
  disable: false,
  holdToDisplay: 1000,
  posX: 0,
  posY: 0,
  mouseButton: MOUSE_BUTTON.RIGHT,
  disableIfShiftIsPressed: false,
  collect() {
    return "";
  }
};

export type TriggerBind = {
  onClick: (event: React.MouseEvent) => void;
  onContextMenu: (event: React.MouseEvent) => void;
  onMouseDown: (event: React.MouseEvent) => void;
  onMouseOut: (event: React.MouseEvent) => void;
  onMouseUp: (event: React.MouseEvent) => void;
  onTouchEnd: (event: React.TouchEvent) => void;
  onTouchStart: (event: React.TouchEvent) => void;
};

export default function buildUseContextMenuTrigger(
  triggerVisible: (data: string) => void,
  setCoords: any
) {
  return (_config: Config): TriggerBind[] => {
    const config = Object.assign({}, defaultConfig, _config);
    const touchHandled = useRef(false);
    const mouseDownTimeoutId = useRef<number>();
    const touchstartTimeoutId = useRef<any>();

    const handleContextClick = (event: React.TouchEvent | React.MouseEvent) => {
      if (config.disable) return;
      if (config.disableIfShiftIsPressed && event.shiftKey) return;

      event.preventDefault();
      event.stopPropagation();

      setCoords(getCoords(event, config));
      triggerVisible(config.collect());
    };

    const handleMouseDown = (event: React.MouseEvent) => {
      if (config.holdToDisplay >= 0 && event.button === MOUSE_BUTTON.LEFT) {
        event.persist();
        event.stopPropagation();

        mouseDownTimeoutId.current = window.setTimeout(
          () => handleContextClick(event),
          config.holdToDisplay
        );
      }
    };

    const handleMouseUp = (event: React.MouseEvent) => {
      if (event.button === MOUSE_BUTTON.LEFT) {
        clearTimeout(mouseDownTimeoutId.current);
      }
    };

    const handleMouseOut = (event: React.MouseEvent) => {
      if (event.button === MOUSE_BUTTON.LEFT) {
        clearTimeout(mouseDownTimeoutId.current);
      }
    };

    const handleTouchstart = (event: React.TouchEvent) => {
      touchHandled.current = false;

      if (config.holdToDisplay >= 0) {
        event.persist();
        event.stopPropagation();

        touchstartTimeoutId.current = setTimeout(() => {
          handleContextClick(event);
          touchHandled.current = true;
        }, config.holdToDisplay);
      }
    };

    const handleTouchEnd = (event: React.TouchEvent) => {
      if (touchHandled.current) {
        event.preventDefault();
      }
      clearTimeout(touchstartTimeoutId.current);
    };

    const handleContextMenu = (event: React.MouseEvent) => {
      if (event.button === config.mouseButton) {
        handleContextClick(event);
      }
    };

    const handleMouseClick = (event: React.MouseEvent) => {
      if (event.button === config.mouseButton) {
        handleContextClick(event);
      }
    };

    const triggerBind = {
      onContextMenu: handleContextMenu,
      onClick: handleMouseClick,
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onTouchStart: handleTouchstart,
      onTouchEnd: handleTouchEnd,
      onMouseOut: handleMouseOut
    };

    return [triggerBind];
  };
}
