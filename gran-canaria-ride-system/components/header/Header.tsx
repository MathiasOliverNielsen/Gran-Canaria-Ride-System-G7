import "components/header/Header.scss";

export default function Header() {
  return (
    <div className="header-bar">
      <div className="header-logo">
        <img src="/images/white-logo.svg" alt="MoveWise logo" />
      </div>

      <div className="menu-button">
        <a href="http://localhost:3000/login">
          <button>
            <img src="/images/user-icon.svg" alt="user-profile" />
          </button>
        </a>
        <button>
          <img src="/images/hamburger-menu-icon.svg" alt="menu" />
        </button>
      </div>
    </div>
  );
}
