"use client"

import "components/header/Header.scss";
import {useHeaderContext} from "../../context/HeaderContext";
import Navbar from "@/components/navbar/Navbar";
import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const { header } = useHeaderContext()
  const [ showNavbar, setShowNavbar ] = useState(false);

  return (
    <>
      <div className={`header-bar ${ header.position === 'sticky' ? 'with-sticky' : 'with-fixed' }`}>
        <div className={`header-logo`}>
          <img src={header.color === 'white' ? "/images/white-logo.svg" : "/images/black-logo.svg"} alt="MoveWise logo"/>
        </div>

        <div className="menu-button">
          <Link href={"/login"}>
            <img src={`/images/${header.color === "white" ? "user-icon.svg" : "user-icon-black.svg"}` } alt="user-profile"/>
          </Link>
          <button onClick={() => setShowNavbar(true)}>
            <img src={`/images/${header.color === "white" ? "hamburger-menu-icon.svg" : "hamburger-menu-icon-black.svg"}`} alt="menu"/>
          </button>
        </div>
      </div>

      <Navbar show={showNavbar} onHamburgerClick={() => setShowNavbar(false)}/>
    </>
  )
}
