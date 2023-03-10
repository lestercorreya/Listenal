import React, { useEffect, useState, useRef } from "react";
import "./home.css";
import { useHistory } from "react-router-dom";
import logo from "../images/logo.png";
import hero_img from "../images/hero_img.jpg";
import google_icon from "../images/google-symbol.png";
import footer_logo from "../images/footer-logo.png";
import GoogleLogin from "react-google-login";
// import { UsernameContext } from "../UsernameContext";

function Home() {
  // const { value2 } = useContext(UsernameContext);
  let history = useHistory();

  var refList = [];
  const heroLeftWritings = useRef();
  const heroImage = useRef();
  refList[0] = useRef();
  refList[1] = useRef();
  refList[2] = useRef();
  refList[3] = useRef();
  const [burgerNavOpen, setBurgerNavOpen] = useState(false);
  function scrollHandler() {
    const triggerBottom = (window.innerHeight / 5) * 4;
    for (var i = 0; i < 4; i++) {
      var top = refList[i].current.getBoundingClientRect().top;
      if (top < triggerBottom) {
        refList[i].current.style.opacity = "1";
      }
    }
  }

  function initialRevealer() {
    heroLeftWritings.current.style.opacity = "1";
    heroImage.current.style.opacity = "1";
  }

  function burgerClicked() {
    setBurgerNavOpen(true);
  }

  function burgerCloseClicked() {
    setBurgerNavOpen(false);
  }

  function responseGoogle(response) {
    localStorage.setItem("username", response.profileObj.email);
    localStorage.setItem("imageUrl", response.profileObj.imageUrl);
    history.push("/chat");
  }

  useEffect(() => {
    window.addEventListener("scroll", scrollHandler);
    initialRevealer();
  }, []);

  return (
    <div className="main">
      {/* nav bar */}
      <nav>
        <div className="home-logo">
          <img src={logo} alt="logo not there" className="home-logo-img" />
          <h2>Listenal</h2>
        </div>
        <ul className="home-nav-links">
          <li>FEATURES</li>
          <li>DOWNLOAD</li>
          <li>SECURITY</li>
          <li>HELP CENTER</li>
        </ul>
        <div className="home-whole-burger">
          <i className="fas fa-bars" onClick={burgerClicked}></i>
          <div
            className="home-burger-links"
            style={{
              transform: burgerNavOpen ? "translateX(0)" : "translateX(-100vw)",
              transition: burgerNavOpen ? "transform 0.3s ease-in" : "none",
            }}
          >
            <i className="fas fa-times" onClick={burgerCloseClicked}></i>
            <ul className="home-burger-nav-links">
              <li>FEATURES</li>
              <li>DOWNLOAD</li>
              <li>SECURITY</li>
              <li>HELP CENTER</li>
            </ul>
          </div>
        </div>
      </nav>
      {/* end of nav bar */}
      {/* hero section */}
      <section className="home-hero-section">
        <div className="home-hero-left">
          <div className="home-hero-left-writings" ref={heroLeftWritings}>
            <h1>Simple. Secure</h1>
            <h1>Reliable messaging.</h1>
            <p className="home-hero-left-writings-para">
              With Listenal, you'll get fast, simple, secure messaging and
              calling for free*, available on phones all over the world.
            </p>
            <GoogleLogin
              clientId="375271093414-45duj5fv8q2bbj5emkbvp04ju4cq09th.apps.googleusercontent.com"
              render={(renderProps) => (
                <div
                  onClick={renderProps.onClick}
                  disabled={renderProps.disabled}
                  className="home-google-button"
                >
                  <img src={google_icon} alt="google icon here" />
                  <p>Sign in with Google</p>
                </div>
              )}
              buttonText="Login"
              onSuccess={responseGoogle}
              onFailure={responseGoogle}
              isSignedIn={true}
              cookiePolicy={"single_host_origin"}
            />
          </div>
        </div>
        <div className="home-hero-right">
          <img
            src={hero_img}
            alt="no hero img"
            className="home-hero-img"
            ref={heroImage}
          />
        </div>
      </section>
      {/* end of hero section */}
      {/* features section */}
      <section className="home-features-section">
        <div className="home-features-title">
          <div className="home-features-title-innerbox">
            <h1>Features</h1>
            <div className="home-features-title-underline"></div>
          </div>
        </div>
        <div className="home-features-leftbox" ref={refList[0]}>
          <h2 className="home-features-eachboxtitle">
            Simple and Reliable Messaging
          </h2>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tempora
          deserunt veritatis id sunt voluptatibus, ducimus repellendus mollitia
          officia cum architecto!
          <div className="home-features-leftbox-triangle"></div>
        </div>
        <div className="home-features-rightbox" ref={refList[1]}>
          <h2 className="home-features-eachboxtitle">
            Chat Freely Without Security Concerns
          </h2>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla, animi!
          Sint inventore quibusdam molestias similique eum nulla corporis quidem
          minus?
          <div className="home-features-rightbox-triangle"></div>
        </div>
        <div className="home-features-leftbox" ref={refList[2]}>
          <h2 className="home-features-eachboxtitle">
            Listen to Music While Chatting
          </h2>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto
          voluptatum nulla ad quis odio veniam reprehenderit reiciendis quisquam
          quas soluta!
          <div className="home-features-leftbox-triangle"></div>
        </div>
        <div className="home-features-rightbox" ref={refList[3]}>
          <h2 className="home-features-eachboxtitle">
            Groups to keep in touch
          </h2>
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Sit aut
          architecto libero delectus ut voluptates commodi ad et dolore
          nesciunt?
          <div className="home-features-rightbox-triangle"></div>
        </div>
        <div className="home-features-moreFeatures">
          <h3>More Features</h3>
        </div>
      </section>
      {/* end of features section */}
      {/* footer section */}
      <footer className="home-footer">
        <div className="home-footer-top">
          <div className="home-footerLogo">
            <img src={footer_logo} alt="footer_logo" />
            <h1 className="home-footerLogo-title">Listenal</h1>
          </div>
          <ul className="home-listenal">
            <h3>Listenal</h3>
            <li>Features</li>
            <li>Security</li>
            <li>Download</li>
            <li>Business</li>
            <li>Privacy</li>
          </ul>
          <ul className="home-company">
            <h3>Company</h3>
            <li>About</li>
            <li>Careers</li>
            <li>Brand Center</li>
            <li>Blog</li>
          </ul>
          <ul className="home-help">
            <h3>Help</h3>
            <li>Help Center</li>
            <li>Twitter</li>
            <li>Facebook</li>
            <li>Coronavirus</li>
          </ul>
        </div>
        <div className="home-footer-bottom">
          <div className="home-footer-bottom-box">
            <p>2021 Listenal LLC</p>
            <p>Privacy & Terms</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
