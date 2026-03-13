"use client"

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import {useHeaderContext} from "../context/HeaderContext";

export default function Home() {
  const sectionRef = useRef(null);
  const { setHeader } = useHeaderContext()
  const initialized = useRef(false);

  useEffect(() => {
    setHeader({
      color: "white",
      position: "fixed"
    })
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!initialized.current) {
          initialized.current = true;
          return;
        }

        if (entry.isIntersecting) {
          setHeader({ color: "white", position: "fixed" });
        } else {
          setHeader({ color: "black", position: "fixed" });
        }
      },
      {
        rootMargin: "-80px 0px 0px 0px",
        threshold: 0,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return (() => {
      setHeader({
        color: "black",
        position: "sticky"
      })
      observer.disconnect()
    })
  }, []);

  return (
    <main>
      <section className="hero-section">
        <img src="/images/hero-section.png" alt="hero-section" className="hero-image"/>
        <img src="/images/hero-section-mobile.png" alt="hero-section" className="hero-image-mobile"/>

        <div className="hero-section-text">
          <p>Ride smart</p>
          <p>Ride electric</p>
          <p>Ride sustainable</p>
        </div>
      </section>

      <div ref={sectionRef}/>

      <section className="about-us">
        <div className="about-us-text">
          <h2>About us</h2>
          <p>At MoveWise, we believe in urban mobility should be clean, accessible, and sustainable. Our company was
            born
            from the need to reduce CO₂ emissions and promote environmentally friendly transportation in our cities.
          </p>
        </div>

        <div className="about-us-photo-section">
          <div className="photo-top">
            <Image className="photo-img" width={200} height={150} src="/images/photo-top.png" alt="woman-renting"/>
          </div>

          <div className="photo-bottom">
            <Image className="photo-img" width={200} height={150} src="/images/photo-bottom.png"
                   alt="make-love-not-co2"/>
          </div>

          <div className="background-square"></div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="how-it-works-text">
          <h2>How it works</h2>
          <p>We provide bikes and electric scooter rentals designed to make daily commuting easier, faster, and greener.
            Our mission is simple: to hel build healthier cities by offering smart mobility solutions that make a real
            difference.
          </p>
        </div>

        <div className="card-section">
          <Link className="card" href={"/rewards"}>
            <img src="/images/rewards-page-icon.png" alt="rewards-page"/>
            <div className={"title"}>Get some points and get some reward</div>
            <div className={"description"}>
              Select your bike and choose the rental plan that fits your needs and get some points
            </div>
          </Link>
          <Link className="card" href={"/challenges"}>
            <img src="/images/challenges-page-icon.png" alt="challenges-page"/>
            <div className={"title"}>Do some challenges and get some points</div>
            <div className={"description"}>Enjoy with our reward system, ride safely and sustainably.</div>
          </Link>
          <Link className="card" href={"/rental-points"}>
            <img src="/images/rental-points-icon.png" alt="rental-points"/>
            <div className={"title"}>Find the available bike near you </div>
            <div className={"description"}>Visit one of our rental points, scan the QR code on your bike or scooter, and unlock it instantly.</div>
          </Link>
        </div>
      </section>
    </main>
  );
}