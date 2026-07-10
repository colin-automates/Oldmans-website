"use client";

import { useEffect, useRef, useState } from "react";

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const getIntroProgress = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const scrollable = Math.max(1, element.offsetHeight - window.innerHeight);
  return clamp(-rect.top / scrollable);
};

const services = [
  {
    number: "01",
    title: "Buy with clarity",
    copy: "A focused search, honest property guidance, and calm support from first showing through closing.",
    href: "https://joeghomes.com/forbuyers",
    link: "Buyer services",
  },
  {
    number: "02",
    title: "Sell with intention",
    copy: "Local pricing intelligence, thoughtful preparation, and a marketing plan designed around your property.",
    href: "https://joeghomes.com/forsellers",
    link: "Seller services",
  },
  {
    number: "03",
    title: "Relocate confidently",
    copy: "Military-informed guidance for Fort Campbell moves, VA financing questions, and compressed timelines.",
    href: "https://joeghomes.com/contact",
    link: "Plan your move",
  },
];

const areas = [
  "Clarksville",
  "Fort Campbell",
  "Adams",
  "Springfield",
  "Pleasant View",
  "Ashland City",
  "Dover",
  "Woodlawn",
  "Dickson",
];

const testimonials = [
  {
    quote:
      "Joe made a long-distance search feel manageable, then helped us read each home with a more experienced eye.",
    name: "Clarksville buyer",
  },
  {
    quote:
      "Responsive, flexible, and always willing to make time. We felt supported through every decision and every visit.",
    name: "Repeat client",
  },
  {
    quote:
      "His local knowledge and clear explanations gave us confidence from the first conversation through closing.",
    name: "Fort Campbell relocation",
  },
];

export default function Home() {
  const introRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const firstCopyRef = useRef<HTMLDivElement>(null);
  const secondCopyRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);
  const filmTimeRef = useRef<HTMLDivElement>(null);
  const filmTimeBarRef = useRef<HTMLElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pastIntro, setPastIntro] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const renderProgress = (value: number) => {
      const firstCopyOpacity = 1 - clamp(value / 0.27);
      const secondCopyOpacity =
        clamp((value - 0.34) / 0.2) *
        (1 - clamp((value - 0.79) / 0.13));
      const curtainProgress = clamp((value - 0.83) / 0.17);

      if (videoRef.current) {
        videoRef.current.style.transform = `scale(${1.01 + value * 0.02})`;
      }
      if (firstCopyRef.current) {
        firstCopyRef.current.style.opacity = String(firstCopyOpacity);
        firstCopyRef.current.style.transform = `translate3d(0, ${-value * 54}px, 0)`;
      }
      if (secondCopyRef.current) {
        secondCopyRef.current.style.opacity = String(secondCopyOpacity);
        secondCopyRef.current.style.transform = `translate3d(0, ${(1 - secondCopyOpacity) * 36}px, 0)`;
      }
      if (scrollCueRef.current) {
        scrollCueRef.current.style.opacity = String(1 - clamp(value / 0.18));
      }
      if (filmTimeRef.current) {
        filmTimeRef.current.style.opacity = String(1 - curtainProgress);
      }
      if (filmTimeBarRef.current) {
        filmTimeBarRef.current.style.transform = `scaleX(${value})`;
      }
      if (curtainRef.current) {
        curtainRef.current.style.transform = `translate3d(0, ${100 - curtainProgress * 100}%, 0)`;
      }
    };

    let lastFrameTime = 0;

    const animate = (timestamp: number) => {
      const target = targetProgressRef.current;
      const current = progressRef.current;
      const delta = target - current;
      const elapsed = lastFrameTime ? Math.min(0.05, (timestamp - lastFrameTime) / 1000) : 1 / 60;
      lastFrameTime = timestamp;
      const easing = 1 - Math.exp(-9.5 * elapsed);
      const next = Math.abs(delta) < 0.00015 ? target : current + delta * easing;

      progressRef.current = next;
      renderProgress(next);

      const video = videoRef.current;
      const mediaTarget = next * 4.96;
      if (
        !reduceMotion &&
        video &&
        video.readyState >= 1 &&
        !video.seeking &&
        Math.abs(video.currentTime - mediaTarget) > 0.04
      ) {
        video.currentTime = mediaTarget;
      }

      const videoNeedsSync = Boolean(
        !reduceMotion &&
          video &&
          video.readyState >= 1 &&
          (video.seeking || Math.abs(video.currentTime - mediaTarget) > 0.04),
      );

      if (Math.abs(target - next) > 0.00015 || videoNeedsSync) {
        frameRef.current = window.requestAnimationFrame(animate);
      } else {
        progressRef.current = target;
        renderProgress(target);
        frameRef.current = null;
        lastFrameTime = 0;
      }
    };

    const updateTarget = () => {
      const intro = introRef.current;
      if (!intro) return;

      const rect = intro.getBoundingClientRect();
      const next = getIntroProgress(intro);
      targetProgressRef.current = next;
      setPastIntro(rect.bottom <= 96);

      if (reduceMotion) {
        progressRef.current = next;
        renderProgress(next);
      } else if (frameRef.current === null) {
        lastFrameTime = 0;
        frameRef.current = window.requestAnimationFrame(animate);
      }
    };

    const initial = introRef.current ? getIntroProgress(introRef.current) : 0;
    progressRef.current = initial;
    targetProgressRef.current = initial;
    renderProgress(initial);
    const initialVideo = videoRef.current;
    if (!reduceMotion && initialVideo && initialVideo.readyState >= 2) {
      initialVideo.currentTime = initial * 4.96;
      if (initial < 0.02) initialVideo.style.opacity = "1";
    }
    updateTarget();
    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", updateTarget);
    return () => {
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", updateTarget);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -5% 0px" },
    );

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-is-open", menuOpen);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.classList.remove("menu-is-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className={`site-header ${pastIntro ? "is-past-intro" : ""}`}>
        <a className="brand" href="#top" aria-label="Joseph Gioielli home">
          <span className="brand-mark">JG</span>
          <span className="brand-copy">
            <strong>Joseph Gioielli</strong>
            <small>Real Estate · eXp Realty</small>
          </span>
        </a>

        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#meet">Meet Joe</a>
          <a href="#services">Services</a>
          <a href="#areas">Areas</a>
          <a href="https://joeghomes.com/listing">Listings</a>
        </nav>

        <a className="header-contact" href="tel:+19313601156">
          <span>Let&apos;s talk</span>
          <span aria-hidden="true">↗</span>
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
      </header>

      <div className={`mobile-menu ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen}>
        <nav aria-label="Mobile navigation">
          {[
            ["Meet Joe", "#meet"],
            ["Services", "#services"],
            ["Areas", "#areas"],
            ["Listings", "https://joeghomes.com/listing"],
          ].map(([label, href], index) => (
            <a key={label} href={href} onClick={() => setMenuOpen(false)}>
              <span>0{index + 1}</span>
              {label}
            </a>
          ))}
        </nav>
        <div className="mobile-menu-footer">
          <a href="tel:+19313601156">(931) 360-1156</a>
          <a href="mailto:joe@joeghomes.com">joe@joeghomes.com</a>
        </div>
      </div>

      <main id="main-content">
        <section id="top" className="intro-scroll" ref={introRef}>
          <div className="intro-sticky">
            <div className="intro-poster" aria-hidden="true" />
            <video
              ref={videoRef}
              className="intro-video"
              muted
              playsInline
              preload="auto"
              poster="/hero-poster.webp"
              aria-hidden="true"
              onLoadedData={(event) => {
                const intro = introRef.current;
                const next = intro ? getIntroProgress(intro) : progressRef.current;
                targetProgressRef.current = next;
                progressRef.current = next;
                const target = next * 4.96;
                event.currentTarget.currentTime = target;
                if (target < 0.02) event.currentTarget.style.opacity = "1";
              }}
              onSeeked={(event) => {
                event.currentTarget.style.opacity = "1";
              }}
            >
              <source src="/hero-tour.mp4" type="video/mp4" />
            </video>
            <div className="intro-vignette" />

            <div ref={firstCopyRef} className="intro-copy intro-copy-first">
              <p className="eyebrow eyebrow-light">Middle Tennessee · Home, in motion</p>
              <h1>
                See home
                <br />
                <em>differently.</em>
              </h1>
            </div>

            <div ref={secondCopyRef} className="intro-copy intro-copy-second">
              <p className="eyebrow eyebrow-light">Joseph Gioielli · Realtor</p>
              <h2>
                The right move
                <br />
                starts with <em>trust.</em>
              </h2>
            </div>

            <div ref={scrollCueRef} className="scroll-cue">
              <span className="scroll-line" />
              <span>Scroll to enter</span>
            </div>

            <div ref={filmTimeRef} className="film-time">
              <span>05.0</span>
              <span className="film-time-track">
                <i ref={filmTimeBarRef} />
              </span>
              <span>10.0</span>
            </div>

            <div ref={curtainRef} className="intro-curtain" />
          </div>
        </section>

        <section className="manifesto section-shell">
          <div className="section-kicker reveal">
            <span>01</span>
            <p>A local guide for your next chapter</p>
          </div>
          <div className="manifesto-grid">
            <h2 className="display-heading reveal">
              Real estate should feel less like a transaction and more like a
              <em> clear way forward.</em>
            </h2>
            <div className="manifesto-note reveal reveal-delay">
              <p>
                Serving Clarksville, Montgomery County, Fort Campbell, and the
                communities around them with straight answers, thoughtful
                strategy, and real local context.
              </p>
              <a className="text-link" href="#meet">
                Meet your agent <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>

          <div className="stats-grid reveal">
            <article>
              <strong>20</strong>
              <span>Total sales</span>
            </article>
            <article>
              <strong>20 yrs</strong>
              <span>Army service</span>
            </article>
            <article>
              <strong>$373K</strong>
              <span>Average sale price</span>
            </article>
            <article>
              <strong>9</strong>
              <span>Sales in the last 12 months</span>
            </article>
          </div>

          <figure className="neighborhood-break reveal">
            <img
              className="fill-image"
              src="/clarksville-neighborhood.webp"
              alt="Contemporary craftsman home in a tree-lined Middle Tennessee neighborhood"
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              <span>Neighborhood perspective · Editorial image</span>
              <p>Established streets. A little more room. A place that feels like yours.</p>
            </figcaption>
          </figure>
        </section>

        <section id="meet" className="about section-shell">
          <div className="about-portrait reveal">
            <div className="portrait-frame">
              <img
                className="fill-image"
                src="/joseph-gioielli.webp"
                alt="Joseph Gioielli, real estate agent with eXp Realty"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="portrait-caption">
              <span>Joseph Gioielli</span>
              <span>TN License 371593</span>
            </div>
          </div>

          <div className="about-copy">
            <div className="section-kicker reveal">
              <span>02</span>
              <p>Meet Joe</p>
            </div>
            <h2 className="display-heading reveal">
              Calm guidance.
              <br />
              <em>Earned perspective.</em>
            </h2>
            <div className="about-body reveal reveal-delay">
              <p>
                After 20 years in the Army, Joe now helps families navigate
                buying, selling, and relocating across the Fort Campbell and
                Clarksville area.
              </p>
              <p>
                His approach pairs local market knowledge with clear
                communication—so you understand the property, the process, and
                the decision in front of you.
              </p>
            </div>
            <a
              className="circle-link reveal"
              href="https://joeghomes.com/agents/Joseph-Gioielli/8934980"
            >
              <span>More about Joe</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>

        <section id="services" className="services section-shell">
          <div className="services-heading">
            <div className="section-kicker reveal">
              <span>03</span>
              <p>Ways to work together</p>
            </div>
            <h2 className="display-heading reveal">
              One relationship.
              <br />
              <em>Every side of the move.</em>
            </h2>
          </div>

          <div className="service-list">
            {services.map((service) => (
              <a
                className="service-card reveal"
                href={service.href}
                key={service.number}
              >
                <span className="service-number">{service.number}</span>
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.copy}</p>
                </div>
                <span className="service-link">
                  {service.link} <i aria-hidden="true">↗</i>
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="relocation">
          <div className="relocation-media">
            <img
              className="fill-image"
              src="/moving-day.webp"
              alt="Warm, sunlit entryway ready for moving day"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="relocation-overlay" />
          <div className="relocation-content section-shell">
            <div className="section-kicker section-kicker-light reveal">
              <span>04</span>
              <p>Military relocation</p>
            </div>
            <div className="relocation-copy reveal">
              <p className="eyebrow eyebrow-light">PCS orders rarely wait</p>
              <h2>
                Fewer unknowns.
                <br />
                <em>A steadier move.</em>
              </h2>
              <p>
                Work with someone who understands military timelines, VA loans,
                and the questions Fort Campbell families need answered first.
              </p>
              <a className="button button-light" href="https://joeghomes.com/contact">
                Start a relocation plan <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </section>

        <section id="areas" className="areas section-shell">
          <div className="section-kicker reveal">
            <span>05</span>
            <p>Local, by design</p>
          </div>
          <div className="areas-intro">
            <h2 className="display-heading reveal">
              Find the place that fits the way you want to <em>live.</em>
            </h2>
            <p className="reveal reveal-delay">
              From an easier Fort Campbell commute to more land, a historic
              main street, or room to slow down—start with what matters to you.
            </p>
          </div>
        </section>

        <div className="area-marquee" aria-label={`Areas served: ${areas.join(", ")}`}>
          <div className="area-marquee-track">
            {[...areas, ...areas].map((area, index) => (
              <span key={`${area}-${index}`}>
                {area} <i>✦</i>
              </span>
            ))}
          </div>
        </div>

        <section className="area-feature section-shell reveal">
          <div className="area-feature-image">
            <img
              className="fill-image"
              src="/tennessee-acreage.webp"
              alt="Modern farmhouse surrounded by open Middle Tennessee acreage"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="area-feature-card">
            <span>Featured market</span>
            <h3>Clarksville, Tennessee</h3>
            <p>
              Connected to Fort Campbell, rich in distinct neighborhoods, and
              full of options for first homes, next homes, and land.
            </p>
            <a href="https://joeghomes.com/listing">
              Explore live listings <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>

        <section className="testimonials section-shell">
          <div className="section-kicker reveal">
            <span>06</span>
            <p>Client perspective</p>
          </div>
          <div className="testimonial-grid">
            {testimonials.map((testimonial, index) => (
              <figure className="testimonial reveal" key={testimonial.name}>
                <span className="quote-mark">“</span>
                <blockquote>{testimonial.quote}</blockquote>
                <figcaption>
                  <span>0{index + 1}</span>
                  {testimonial.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="home-value section-shell reveal">
          <div>
            <p className="eyebrow">Thinking about selling?</p>
            <h2>Start with the number that changes every decision.</h2>
          </div>
          <a className="button button-dark" href="https://joeghomes.com/evaluation">
            Get your home value <span aria-hidden="true">↗</span>
          </a>
        </section>

        <section id="contact" className="contact-section">
          <div className="contact-orbit" aria-hidden="true">
            <span>LET&apos;S TALK · LET&apos;S TALK · LET&apos;S TALK · </span>
          </div>
          <div className="contact-inner section-shell">
            <p className="eyebrow reveal">Your next move can start here</p>
            <h2 className="reveal">
              Ready when
              <br />
              <em>you are.</em>
            </h2>
            <div className="contact-actions reveal">
              <a href="tel:+19313601156">
                <small>Call Joe</small>
                <strong>(931) 360-1156</strong>
                <span aria-hidden="true">↗</span>
              </a>
              <a href="mailto:joe@joeghomes.com">
                <small>Write Joe</small>
                <strong>joe@joeghomes.com</strong>
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer section-shell">
        <div className="footer-brand">
          <span className="brand-mark brand-mark-dark">JG</span>
          <div>
            <strong>Joseph Gioielli</strong>
            <p>Real Estate · eXp Realty</p>
          </div>
        </div>
        <div className="footer-meta">
          <p>3401 Mallory Lane #100, Franklin, TN 37067</p>
          <p>Tennessee License 371593</p>
        </div>
        <div className="footer-links">
          <a href="https://joeghomes.com">Official site</a>
          <a href="https://joeghomes.com/contact">Contact</a>
          <a href="#top">Back to top ↑</a>
        </div>
        <p className="footer-legal">
          © {new Date().getFullYear()} Joseph Gioielli. All rights reserved.
          eXp Realty. Information deemed reliable but not guaranteed.
        </p>
      </footer>
    </>
  );
}
