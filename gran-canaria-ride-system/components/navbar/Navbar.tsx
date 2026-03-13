import Link from "next/link";
import "./Navbar.scss";

interface Props {
  show: boolean;
  onHamburgerClick?: () => void;
}

export default function Navbar({ show, onHamburgerClick }: Props) {

  const routes = [
    {
      key: "home",
      name: "Home",
      image: "home-icon.svg",
      href: "/"
    },
    {
      key: "challenges",
      name: "Challenges",
      image: "challenge-icon.svg",
      href: "/challenges"
    },
    {
      key: "rewards",
      name: "Rewards",
      image: "reward-icon.svg",
      href: "/rewards"
    },
    {
      key: "bicycles",
      name: "Bicycles",
      image: "bicycle-icon.svg",
      href: "/rental-points"
    },
  ]

  if (!show) {
    return <></>
  }

  return  (
    <div className={"navbar-container"} onClick={() => onHamburgerClick?.()}>
      <nav className={"navbar"}>
        <div>
          <div className={"navbar-hamburger-container"}>
            <button onClick={() => onHamburgerClick?.()}>
              <img src={"/images/hamburger-menu-icon.svg"} alt="menu"/>
            </button>
          </div>
          <div className={"navbar-routes-list"}>
            {
              routes.map((route) => {
                return <Link key={route.key} href={route.href} className={"navbar-route-item"}>
                  <img src={`/images/${route.image}`} alt={route.name}/>
                  <div>{route.name}</div>
                </Link>
              })
            }
          </div>
        </div>
        <div className={"navbar-logout-container"}>
          <Link href={"/login"} className={"navbar-logout"}>
            <img src={"/images/logout-icon.svg"} alt={"logout"} />
            <div>Logout</div>
          </Link>
        </div>

      </nav>
    </div>
  )


}