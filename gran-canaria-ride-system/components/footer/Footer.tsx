import "components/footer/Footer.scss";

export default function Footer() {


  return (
    <div className="footer-container">
      <div className="footer-text-container">
        <p>Use of Cookies</p>
        <p>Privacy Policy</p>
        <p>Terms of Use and Conditions</p>
      </div>

      <div className="footer-icons-container">
        <button><img src="/images/instagram-icon.svg" alt="instagram-logo"/></button>
        <button><img src="/images/twitter-icon.svg" alt="twitter-logo"/></button>
        <button><img src="/images/facebook-icon.svg" alt="facebook-logo"/></button>
      </div>
    </div>
  );
}
