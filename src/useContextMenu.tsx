import {
  useLayoutEffect,
  useRef,
  useState,
  useEffect,
  useCallback
} from "react";
import { getMenuPosition, getRTLMenuPosition } from "./helpers";
import buildUseContextMenuTrigger, {
  TriggerBind,
  Config
} from "./buildUseContextMenuTrigger";

export type BindMenu = {
  style: React.CSSProperties;
  ref: React.MutableRefObject<HTMLElement | undefined>;
  role: string;
  tabIndex: number;
};

const ESCAPE = 27;
const baseStyles: React.CSSProperties = {
  position: "fixed",
  opacity: 0,
  pointerEvents: "none"
};

const focusElement = (el: HTMLElement) => el.focus();
const useContextMenu = ({
  rtl = false,
  handleElementSelect = focusElement
} = {}): [BindMenu, any, (_config: Config) => TriggerBind[], any] => {
  const menuRef = useRef<HTMLElement>();
  const selectables = useRef<any[]>([]);
  const [style, setStyles] = useState(baseStyles);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isVisible, setVisible] = useState(false);
  const [coords, setCoords] = useState();
  const [collectedData, setCollectedData] = useState();
  const hideMenu = useCallback(() => setVisible(false), [setVisible]);
  const triggerVisible = useCallback(
    data => {
      setVisible(true);
      setCollectedData(data);
    },
    [setVisible, setCollectedData]
  );

  const markSelectable = (el: any) =>
    (selectables.current = el === null ? [] : [...selectables.current, el]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      !menuRef.current!.contains(e.target as Node) && hideMenu();
    };
    const handleKeyNavigation = (e: any) => {
      switch (e.keyCode) {
        case ESCAPE:
          e.preventDefault();
          hideMenu();
          break;
        case 38: // up arrow
          e.preventDefault();
          if (selectedIndex > 0) {
            setSelectedIndex(s => s - 1);
            handleElementSelect(selectables.current[selectedIndex - 1]);
          }
          break;
        case 40: // down arrow
          e.preventDefault();
          if (selectedIndex + 1 < selectables.current.length) {
            setSelectedIndex(s => s + 1);
            handleElementSelect(selectables.current[selectedIndex + 1]);
          }
          break;
        case 13: // enter
          selectables.current[selectedIndex].click();
          hideMenu();
          break;
        default:
      }
    };
    if (isVisible) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
      document.addEventListener("scroll", hideMenu);
      document.addEventListener("contextmenu", hideMenu);
      document.addEventListener("keydown", handleKeyNavigation);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("scroll", hideMenu);
      document.removeEventListener("contextmenu", hideMenu);
      document.removeEventListener("keydown", handleKeyNavigation);
    };
  }, [
    menuRef,
    hideMenu,
    selectedIndex,
    setSelectedIndex,
    selectables,
    handleElementSelect,
    isVisible
  ]);

  useLayoutEffect(() => {
    if (isVisible) {
      const rect = menuRef.current!.getBoundingClientRect();
      const { top, left } = rtl
        ? getRTLMenuPosition(rect, coords)
        : getMenuPosition(rect, coords);
      setStyles(st => ({
        ...st,
        top: `${top}px`,
        left: `${left}px`,
        opacity: 1,
        pointerEvents: "auto"
      }));
    } else {
      setStyles(baseStyles);
    }
  }, [menuRef, isVisible, coords]);

  const bindMenu: BindMenu = {
    style,
    ref: menuRef,
    role: "menu",
    tabIndex: -1
  };

  const bindMenuItems = {
    ref: markSelectable,
    role: "menuitem",
    tabIndex: -1
  };
  return [
    bindMenu,
    bindMenuItems,
    buildUseContextMenuTrigger(triggerVisible, setCoords),
    {
      data: collectedData,
      isVisible,
      setVisible,
      coords,
      setCoords
    }
  ];
};

export default useContextMenu;
