import { Dropdown } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import "./styles/main.css"

const items = [
  {
    key: "about",
    label: <a href="#about" className="menu-item">About</a>
  },
  {
    key: "getstarted",
    label: <a href="#getstarted" className="menu-item">Get Started</a>
  }
];

const MobileMenu = () => {
  return (
    <Dropdown
      menu={{ items }}
      placement="bottomRight"
      trigger={["click"]}
    >
      <div className="mobile-menu-btn nav-animation">
        <MenuOutlined />
      </div>
    </Dropdown>
  );
};

export default MobileMenu;
