import React from "react";
import { BindMenu, Coords, BindMenuItems } from "../../src/useContextMenu";

type Props = {
  bindMenu: BindMenu;
  data: any;
  bindMenuItem: BindMenuItems;
  coords: Coords;
  setClickedCmd: any;
  hideMenu: any;
};

function Menu({
  bindMenu,
  data,
  bindMenuItem,
  coords,
  setClickedCmd,
  hideMenu
}: Props) {
  const handleMenuItemClick = (n: string) => () => {
    setClickedCmd(n);
    hideMenu();
  };

  return (
    <div {...bindMenu} className="menu">
      <p>
        It works! <span>Click coords: {JSON.stringify(coords)}</span>
      </p>
      <p>Triggered by {data}</p>
      <p>Navigate with arrows</p>
      <p>Enter will trigger an onClick</p>
      <p>Esc will close the menu</p>
      <hr />
      <p
        {...bindMenuItem}
        onFocus={() => console.log("focused")}
        onClick={handleMenuItemClick("first")}
      >
        First command
      </p>
      <p {...bindMenuItem} onClick={handleMenuItemClick("second")}>
        Second command
      </p>
      <hr />
      <p {...bindMenuItem} onClick={handleMenuItemClick("third")}>
        Third command
      </p>
    </div>
  );
}

export default Menu;
