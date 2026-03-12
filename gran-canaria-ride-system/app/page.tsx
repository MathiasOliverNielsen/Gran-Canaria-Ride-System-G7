import Link from "next/link";
import Image from "next/image";

export default function Home() {
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
          
        </div>
      </section>

      {/*<p>*/}
      {/*  <Link href="/rewards" className="text-blue-500 underline">*/}
      {/*    View rewards*/}
      {/*  </Link>*/}
      {/*</p>*/}
    </main>
  );
}

