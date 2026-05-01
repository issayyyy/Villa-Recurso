/**
 * Villa Recurso Resort — Single-Page Website
 * Theme  : Sophisticated Light (off-white base, warm orange/yellow accents)
 * Paths  : All assets prefixed with public/
 * CTAs   : Book Now → https://m.me/VillaRecurso
 * Layout : No outer margin / parallel-line artefacts
 */

import { useState, useEffect, useRef } from "react";
import AvailabilityCalendar from "./AvailabilityCalendar";
import {
  MapPin, Phone, Mail, Facebook, Menu, X,
  Bath, Coffee, Flame, Music, Mountain, Waves,
  UtensilsCrossed, Sparkles, ArrowRight, Wind,
} from "lucide-react";

/* ────────────────────────── Font Loader ────────────────────────── */
function FontLoader() {
  useEffect(() => {
    const el = document.createElement("link");
    el.rel  = "stylesheet";
    el.href =
      "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Poppins:wght@300;400;500;600&display=swap";
    document.head.appendChild(el);
  }, []);
  return null;
}

/* ────────────────────────── Scroll Reveal ──────────────────────── */
function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ────────────────────────── Design Tokens ──────────────────────── */
const T = {
  bg:       "#FAFAF8",
  surface:  "#F5F3EF",
  card:     "#FFFFFF",
  stone:    "#EAE7E1",
  text:     "#1A1815",
  mid:      "#5A5550",
  light:    "#9A9490",
  orange:   "#ffb054",
  yellow:   "#ffd737",
  border:   "rgba(0,0,0,0.07)",
  borderHov:"rgba(255,176,84,0.45)",
  serif:    "'Playfair Display', Georgia, serif",
  script:   "'Cormorant Garamond', Georgia, serif",
  sans:     "'Poppins', system-ui, sans-serif",
};

/* ────────────────────────── Reusable CTA ───────────────────────── */
function CTABtn({ children, style = {}, iconLeft, href = "https://m.me/VillaRecurso" }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        fontFamily: T.sans, fontSize: 11, fontWeight: 600,
        letterSpacing: "0.14em", textTransform: "uppercase",
        color: T.text, textDecoration: "none",
        padding: "12px 26px", borderRadius: 50,
        background: `linear-gradient(135deg, ${T.orange}, ${T.yellow})`,
        boxShadow: hov ? "0 10px 32px rgba(255,176,84,0.45)" : "0 3px 16px rgba(255,176,84,0.25)",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        transition: "transform 0.28s ease, box-shadow 0.28s ease",
        cursor: "pointer",
        ...style,
      }}
    >
      {iconLeft}{children}
    </a>
  );
}

/* ────────────────────────── Navbar ─────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 70);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "Rooms",        href: "#accommodations" },
    { label: "Availability", href: "#availability"   },
    { label: "Gallery",      href: "#gallery"        },
    { label: "Location",     href: "#location"       },
    { label: "Contact",      href: "#contact"        },
  ];

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(250,250,248,0.93)" : "transparent",
      backdropFilter: scrolled ? "blur(18px)" : "none",
      borderBottom: scrolled ? `1px solid ${T.stone}` : "none",
      transition: "background 0.45s ease, backdrop-filter 0.45s ease, border-color 0.45s ease",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "0 40px", height: 70,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <a href="#hero" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img
            src="public/logo.png"
            alt="Villa Recurso"
            style={{
              height: 40, width: "auto",
              filter: scrolled ? "none" : "drop-shadow(0 2px 8px rgba(0,0,0,0.55))",
              transition: "filter 0.4s ease",
            }}
          />
        </a>

        <nav className="hidden md:flex" style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {links.map(l => (
            <NavLink key={l.label} href={l.href} scrolled={scrolled}>{l.label}</NavLink>
          ))}
          <CTABtn style={{ fontSize: 11, padding: "10px 22px" }}>Book Now</CTABtn>
        </nav>

        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          style={{ background: "none", border: "none", cursor: "pointer", color: scrolled ? T.mid : "#fff", padding: 4, lineHeight: 0 }}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div style={{
        overflow: "hidden", maxHeight: open ? 400 : 0,
        transition: "max-height 0.4s ease",
        background: "rgba(250,250,248,0.97)",
        backdropFilter: "blur(20px)",
        borderTop: open ? `1px solid ${T.stone}` : "none",
      }}>
        <div style={{ padding: "14px 40px 24px" }}>
          {links.map(l => (
            <a
              key={l.label} href={l.href}
              onClick={() => setOpen(false)}
              style={{
                display: "block", fontFamily: T.sans, fontSize: 12, fontWeight: 500,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: T.mid, textDecoration: "none",
                padding: "12px 0", borderBottom: `1px solid ${T.stone}`,
              }}
            >{l.label}</a>
          ))}
          <div style={{ marginTop: 20 }}>
            <CTABtn style={{ width: "100%", justifyContent: "center" }}>Book Now</CTABtn>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, scrolled, children }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative",
        fontFamily: T.sans, fontSize: 12, fontWeight: 500,
        letterSpacing: "0.1em", textTransform: "uppercase",
        color: hov ? T.orange : (scrolled ? T.mid : "rgba(255,255,255,0.85)"),
        textDecoration: "none", transition: "color 0.25s",
      }}
    >
      {children}
      <span style={{
        position: "absolute", bottom: -3, left: 0,
        width: hov ? "100%" : 0, height: 1,
        background: T.orange,
        transition: "width 0.25s ease", borderRadius: 1,
      }} />
    </a>
  );
}

/* ────────────────────────── Hero ───────────────────────────────── */
function Hero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 80); return () => clearTimeout(t); }, []);

  const anim = (delay = 0) => ({
    opacity:   loaded ? 1 : 0,
    transform: loaded ? "translateY(0)" : "translateY(18px)",
    transition: `opacity 1.1s ease ${delay}s, transform 1.1s ease ${delay}s`,
  });

  return (
    <section id="hero" style={{
      position: "relative", width: "100%", minHeight: "100vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      overflow: "hidden", margin: 0, padding: 0,
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url('public/resort-5.jpg')",
        backgroundSize: "cover", backgroundPosition: "center 38%",
        transform: "scale(1.04)", transition: "transform 14s ease-out",
      }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(8,6,4,0.52) 0%, rgba(8,6,4,0.28) 42%, rgba(8,6,4,0.62) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 20%, rgba(0,0,0,0.45) 100%)" }} />

      <div style={{
        position: "relative", zIndex: 2,
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center", padding: "0 24px", maxWidth: 700, margin: 0,
      }}>
        <div style={{ ...anim(0), marginBottom: 28 }}>
          <img
            src="public/logo.png" alt="Villa Recurso"
            style={{ height: 210, width: "auto", filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.65))" }}
          />
        </div>

        <div style={{
          ...anim(0.35), width: 1, height: 44,
          background: "linear-gradient(to bottom, transparent, rgba(255,176,84,0.55), transparent)",
          marginBottom: 24,
        }} />

        <p style={{
          ...anim(0.55), fontFamily: T.sans, fontSize: 10, fontWeight: 500,
          letterSpacing: "0.3em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.55)", marginBottom: 22,
        }}>
          Kapatagan · Digos City · Davao Del Sur
        </p>

        <h1 style={{
          ...anim(0.75), fontFamily: T.script,
          fontSize: "clamp(27px, 5.2vw, 48px)",
          fontStyle: "italic", fontWeight: 300,
          color: "#fff", lineHeight: 1.45,
          textShadow: "0 2px 28px rgba(0,0,0,0.45)",
          marginBottom: 42, letterSpacing: "0.01em",
        }}>
          "Escape to the highlands, where the<br />
          <span style={{ fontWeight: 400 }}>mountain meets your soul."</span>
        </h1>

        <div style={{ ...anim(1.05), display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          <CTABtn>Book Your Stay</CTABtn>
          <a
            href="#accommodations"
            style={{
              fontFamily: T.sans, fontSize: 11, fontWeight: 500,
              letterSpacing: "0.16em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.82)", textDecoration: "none",
              padding: "12px 28px", borderRadius: 50,
              border: "1px solid rgba(255,255,255,0.28)",
              backdropFilter: "blur(8px)", background: "rgba(255,255,255,0.05)",
              transition: "all 0.25s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,176,84,0.55)"; e.currentTarget.style.color = T.orange; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)"; e.currentTarget.style.color = "rgba(255,255,255,0.82)"; }}
          >
            Explore Rooms
          </a>
        </div>
      </div>

      <div style={{
        position: "absolute", bottom: 34, left: "50%", transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        opacity: loaded ? 0.65 : 0, transition: "opacity 1s ease 2.2s", zIndex: 2,
      }}>
        <p style={{ fontFamily: T.sans, fontSize: 9, letterSpacing: "0.26em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>Scroll</p>
        <div style={{ width: 22, height: 34, borderRadius: 11, border: "1.5px solid rgba(255,255,255,0.32)", display: "flex", justifyContent: "center", paddingTop: 6 }}>
          <div style={{ width: 3, height: 8, borderRadius: 2, background: T.orange, animation: "scrollDot 2s ease-in-out infinite" }} />
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100, background: `linear-gradient(to bottom, transparent, ${T.bg})`, pointerEvents: "none", zIndex: 3 }} />

      <style>{`
        @keyframes scrollDot { 0%,100%{transform:translateY(0);opacity:1;} 60%{transform:translateY(10px);opacity:0.1;} }
      `}</style>
    </section>
  );
}

/* ────────────────────────── Stats Strip ────────────────────────── */
function StatsStrip() {
  return (
    <div style={{
      background: T.surface, borderBottom: `1px solid ${T.stone}`,
      padding: "26px 40px",
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 52, flexWrap: "wrap",
    }}>
      {[
        { num: "4+",   label: "Unique Stays"        },
        { num: "∞",    label: "Highland Experiences" },
        { num: "★ 5",  label: "Guest Rating"         },
        { num: "24/7", label: "Concierge Service"    },
      ].map((s, i) => (
        <div key={i} style={{ textAlign: "center" }}>
          <p style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 500, color: T.orange, margin: 0 }}>{s.num}</p>
          <p style={{ fontFamily: T.sans, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: T.light, marginTop: 5 }}>{s.label}</p>
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────── Section Heading ────────────────────── */
function SectionHeading({ eyebrow, title, subtitle, centered = true }) {
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} style={{
      textAlign: centered ? "center" : "left",
      maxWidth: centered ? 560 : 500,
      margin: centered ? "0 auto" : 0,
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(22px)",
      transition: "opacity 0.8s ease, transform 0.8s ease",
    }}>
      <p style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", color: T.orange, marginBottom: 10 }}>{eyebrow}</p>
      <div style={{ width: 28, height: 1, background: `linear-gradient(90deg, ${T.orange}, ${T.yellow})`, margin: centered ? "0 auto 18px" : "0 0 18px" }} />
      <h2 style={{ fontFamily: T.serif, fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 500, lineHeight: 1.25, color: T.text, margin: "0 0 14px" }}>{title}</h2>
      {subtitle && <p style={{ fontFamily: T.sans, fontSize: 13.5, fontWeight: 300, lineHeight: 1.9, color: T.mid }}>{subtitle}</p>}
    </div>
  );
}

/* ────────────────────────── Room Data ──────────────────────────── */
const rooms = [
  {
    id: "arch", name: "Arch Cabin", sub: "Kawa Bliss Bure",
    badge: "🔥 Best Seller", price: "3,000", image: "public/cabin-hero.jpg", flip: false,
    desc: "A charming arched sanctuary nestled among bamboo groves. Intimate, unique, and impossibly cozy — this is highland living at its most authentic.",
    inclusions: [
      { icon: <Bath size={14} />,     text: "Free Kawa Hot Bath"    },
      { icon: <Wind size={14} />,     text: "Cool Mountain Breeze"  },
      { icon: <Sparkles size={14} />, text: "Exclusive Garden Patio"},
    ],
  },
  {
    id: "octatel", name: "Octatel Room", sub: "Mountain Cozy Bure",
    badge: null, price: "2,000", image: "public/octatel.jpg", flip: true,
    desc: "Warm and inviting, the Octatel is our most sociable retreat. Wake to mountain air, gather around the bonfire, and let the highland evenings sing.",
    inclusions: [
      { icon: <Coffee size={14} />, text: "Free Breakfast for 2" },
      { icon: <Flame size={14} />,  text: "Bonfire Experience"   },
      { icon: <Music size={14} />,  text: "Videoke Included"     },
    ],
  },
  {
    id: "dojo", name: "Japanese Dojo", sub: "Zen Highland Retreat",
    badge: "✦ Premium", price: "6,000", image: "public/japanese-dojo.jpg", flip: false,
    desc: "Inspired by the quiet philosophy of Japanese design — shoji screens, clean lines, and a profound connection to the natural world surrounding you.",
    inclusions: [
      { icon: <Sparkles size={14} />, text: "Authentic Zen Architecture"},
      { icon: <Bath size={14} />,     text: "Private Kawa Hot Bath"     },
      { icon: <Mountain size={14} />, text: "Garden Forest Views"        },
    ],
  },
  {
    id: "villa", name: "Family Villa", sub: "The Crown Residence",
    badge: "◈ Luxury", price: "12,000", image: "public/resort-5.jpg", flip: true,
    desc: "Villa Recurso's most exclusive address. Panoramic Mt. Apo views greet every morning from a private jacuzzi, while a full kitchen makes each moment feel like home.",
    inclusions: [
      { icon: <Mountain size={14} />,        text: "Private Mt. Apo Views" },
      { icon: <Waves size={14} />,           text: "Private Jacuzzi"        },
      { icon: <UtensilsCrossed size={14} />, text: "Full Kitchen Access"    },
    ],
  },
];

/* ────────────────────────── Inclusion Row ──────────────────────── */
function IncRow({ icon, text }) {
  const [hov, setHov] = useState(false);
  return (
    <li
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 0", borderBottom: `1px solid ${T.stone}`,
        cursor: "default",
        transform: hov ? "translateX(5px)" : "translateX(0)",
        transition: "transform 0.25s ease",
      }}
    >
      <span style={{ color: hov ? T.orange : T.light, flexShrink: 0, transform: hov ? "translateY(-1px)" : "translateY(0)", transition: "color 0.25s ease, transform 0.25s ease" }}>{icon}</span>
      <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 400, color: hov ? T.text : T.mid, letterSpacing: "0.02em", transition: "color 0.25s ease" }}>{text}</span>
    </li>
  );
}

/* ────────────────────────── Room Card ──────────────────────────── */
function RoomCard({ room, index }) {
  const [ref, vis] = useReveal(0.08);
  const [hov, setHov] = useState(false);

  return (
    <article ref={ref} style={{
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(40px)",
      transition: `opacity 0.85s ease ${index * 0.13}s, transform 0.85s ease ${index * 0.13}s`,
      maxWidth: 1100, margin: "0 auto 72px", padding: "0 28px",
    }}>
      <div
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        className="room-card-inner"
        style={{
          borderRadius: 26, overflow: "hidden", background: T.card,
          border: hov ? `1px solid ${T.borderHov}` : `1px solid ${T.stone}`,
          boxShadow: hov ? "0 28px 64px rgba(0,0,0,0.13), 0 6px 24px rgba(255,176,84,0.12)" : "0 4px 28px rgba(0,0,0,0.06)",
          transform: hov ? "translateY(-8px)" : "translateY(0)",
          transition: "transform 0.38s ease, box-shadow 0.38s ease, border-color 0.38s ease",
        }}
      >
        <style>{`
          .room-card-inner{display:flex;flex-direction:column;}
          @media(min-width:768px){
            .room-card-inner{flex-direction:row!important;}
            .room-img-col{width:52%!important;min-height:460px!important;}
            .room-text-col{width:48%!important;}
            .flip-img{order:2!important;}
            .flip-text{order:1!important;}
          }
        `}</style>

        <div className={`room-img-col${room.flip ? " flip-img" : ""}`}
          style={{ position: "relative", minHeight: 280, overflow: "hidden", width: "100%", flexShrink: 0 }}>
          <img src={room.image} alt={room.name}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: hov ? "scale(1.05)" : "scale(1)", transition: "transform 0.7s ease" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)" }} />
          <div style={{ position: "absolute", bottom: 20, left: 20, background: "rgba(8,6,4,0.72)", backdropFilter: "blur(12px)", borderRadius: 50, padding: "7px 18px", border: "1px solid rgba(255,255,255,0.12)" }}>
            <span style={{ fontFamily: T.serif, fontSize: 19, fontWeight: 500, color: T.yellow }}>
              ₱{room.price}<span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 300, color: "rgba(255,255,255,0.45)", marginLeft: 4 }}>/night</span>
            </span>
          </div>
          {room.badge && (
            <div style={{ position: "absolute", top: 20, right: 20, background: "rgba(8,6,4,0.6)", backdropFilter: "blur(10px)", border: `1px solid rgba(255,176,84,0.4)`, borderRadius: 50, padding: "5px 14px" }}>
              <span style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: T.orange }}>{room.badge}</span>
            </div>
          )}
        </div>

        <div className={`room-text-col${room.flip ? " flip-text" : ""}`}
          style={{ padding: "44px", display: "flex", flexDirection: "column", justifyContent: "center", width: "100%" }}>
          <p style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 500, letterSpacing: "0.26em", textTransform: "uppercase", color: T.orange, marginBottom: 8 }}>{room.sub}</p>
          <h3 style={{ fontFamily: T.serif, fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 500, color: T.text, margin: "0 0 16px", lineHeight: 1.2 }}>{room.name}</h3>
          <p style={{ fontFamily: T.sans, fontSize: 13.5, fontWeight: 300, color: T.mid, lineHeight: 1.9, marginBottom: 28 }}>{room.desc}</p>
          <ul style={{ listStyle: "none", margin: "0 0 32px", padding: 0 }}>
            {room.inclusions.map((inc, i) => <IncRow key={i} icon={inc.icon} text={inc.text} />)}
          </ul>
          <CTABtn style={{ alignSelf: "flex-start" }}>
            Book This Room <ArrowRight size={13} />
          </CTABtn>
        </div>
      </div>
    </article>
  );
}

/* ────────────────────────── Accommodations ─────────────────────── */
function Accommodations() {
  return (
    <section id="accommodations" style={{ background: T.bg, paddingBottom: 100 }}>
      <div style={{ paddingTop: 96, paddingBottom: 72 }}>
        <SectionHeading eyebrow="Our Stays" title="Curated Accommodations"
          subtitle="Each space at Villa Recurso is a unique world — designed to dissolve the boundary between comfort and highland nature." />
      </div>
      {rooms.map((r, i) => <RoomCard key={r.id} room={r} index={i} />)}
    </section>
  );
}

/* ────────────────────────── Gallery ────────────────────────────── */
const gallery = [
  { src: "public/resort-1.jpg",      label: "I ♥ Recurso",       wide: true  },
  { src: "public/kawa-bath.jpg",     label: "Kawa Hot Bath",      wide: false },
  { src: "public/function-hall.jpg", label: "Game Hall",          wide: false },
  { src: "public/resort-4.jpg",      label: "Landmark Windmill",  wide: false },
  { src: "public/resort-2.jpg",      label: "Bar Lounge",         wide: false },
  { src: "public/japanese-dojo.jpg", label: "Japanese Dojo",      wide: true  },
  { src: "public/videoke.jpg",       label: "Music Room",         wide: false },
  { src: "public/resort-3.jpg",      label: "Junkyard Resto Bar", wide: false },
];

function GalleryThumb({ item, index }) {
  const [hov, setHov] = useState(false);
  const [ref, vis]    = useReveal(0.04);
  return (
    <div ref={ref} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className={item.wide ? "col-span-2" : ""}
      style={{
        position: "relative", aspectRatio: item.wide ? "2/1" : "4/3",
        borderRadius: 16, overflow: "hidden", cursor: "pointer",
        border: hov ? `1px solid ${T.borderHov}` : `1px solid ${T.stone}`,
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hov ? "0 16px 40px rgba(0,0,0,0.12)" : "0 2px 12px rgba(0,0,0,0.05)",
        opacity: vis ? 1 : 0,
        transition: `opacity 0.7s ease ${index * 55}ms, transform 0.35s ease, box-shadow 0.35s ease, border-color 0.3s ease`,
      }}
    >
      <img src={item.src} alt={item.label}
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: hov ? "scale(1.06)" : "scale(1)", transition: "transform 0.65s ease" }}
      />
      <div style={{
        position: "absolute", inset: 0,
        background: hov ? "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.05) 55%, transparent 100%)" : "linear-gradient(to top, rgba(0,0,0,0.32) 0%, transparent 48%)",
        display: "flex", alignItems: "flex-end", padding: 16, transition: "background 0.4s ease",
      }}>
        <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: hov ? "#fff" : "rgba(255,255,255,0.58)", transform: hov ? "translateY(0)" : "translateY(4px)", transition: "color 0.3s, transform 0.3s" }}>{item.label}</span>
      </div>
    </div>
  );
}

function Gallery() {
  return (
    <section id="gallery" style={{ background: T.surface, padding: "100px 0", borderTop: `1px solid ${T.stone}`, borderBottom: `1px solid ${T.stone}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px" }}>
        <div style={{ marginBottom: 56 }}>
          <SectionHeading eyebrow="The Resort" title="A World of Its Own"
            subtitle="From bamboo game halls to Zen gardens — every corner tells a story of care, character, and highland spirit." />
        </div>
        <div className="gallery-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          <style>{`
            @media(max-width:640px){.gallery-grid{grid-template-columns:1fr 1fr!important;}}
            .col-span-2{grid-column:span 2;}
          `}</style>
          {gallery.map((item, i) => <GalleryThumb key={i} item={item} index={i} />)}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────── Location ───────────────────────────── */
function Location() {
  const [ref, vis] = useReveal(0.1);
  return (
    <section id="location" style={{ background: T.bg, padding: "100px 0" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 28px" }}>
        <div style={{ marginBottom: 52 }}>
          <SectionHeading eyebrow="Getting Here" title="Find Us in the Highlands"
            subtitle="Nestled in the cool embrace of Kapatagan, Digos City — Villa Recurso is a world apart, yet closer than you think." />
        </div>
        <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.9s ease, transform 0.9s ease" }}>
          <div style={{ borderRadius: 24, overflow: "hidden", border: `1px solid ${T.stone}`, boxShadow: "0 12px 48px rgba(0,0,0,0.08)" }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6245.935787786119!2d125.33770254454262!3d6.927645985008703!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32f9a94aec4b90f5%3A0xc5f40d5708bc6952!2sVilla%20Recurso!5e0!3m2!1sen!2sph!4v1773841198521!5m2!1sen!2sph"
              width="100%" height="440" style={{ border: 0, display: "block" }}
              allowFullScreen loading="lazy" title="Villa Recurso Location"
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginTop: 18 }}>
            {[
              { icon: <MapPin size={16} />,   label: "Address",  value: "Purok 2, Kapatagan, Digos City, Davao Del Sur" },
              { icon: <Phone size={16} />,    label: "Mobile",   value: "0951 026 5165",  href: "tel:+639510265165" },
              { icon: <Facebook size={16} />, label: "Facebook", value: "VillaRecurso",   href: "https://www.facebook.com/VillaRecurso" },
            ].map((c, i) => <ContactChip key={i} {...c} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactChip({ icon, label, value, href }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "flex-start", gap: 14,
        padding: "18px 20px", borderRadius: 16, background: T.card,
        border: hov ? `1px solid ${T.borderHov}` : `1px solid ${T.stone}`,
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hov ? "0 8px 24px rgba(0,0,0,0.07)" : "0 2px 8px rgba(0,0,0,0.04)",
        transition: "transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease",
      }}
    >
      <span style={{ color: T.orange, marginTop: 1, flexShrink: 0 }}>{icon}</span>
      <div>
        <p style={{ fontFamily: T.sans, fontSize: 9, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: T.light, margin: "0 0 4px" }}>{label}</p>
        {href ? (
          <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
            style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 400, color: T.text, textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = T.orange}
            onMouseLeave={e => e.currentTarget.style.color = T.text}
          >{value}</a>
        ) : (
          <p style={{ fontFamily: T.sans, fontSize: 13, color: T.text, margin: 0 }}>{value}</p>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────── Contact / CTA ──────────────────────── */
function Contact() {
  const [ref, vis] = useReveal(0.15);
  return (
    <section id="contact" style={{ background: T.surface, borderTop: `1px solid ${T.stone}`, padding: "100px 24px 90px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", bottom: -120, right: -120, width: 480, height: 480, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,176,84,0.09), transparent 65%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: -80, left: -80, width: 360, height: 360, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,215,55,0.07), transparent 65%)`, pointerEvents: "none" }} />

      <div ref={ref} style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1, opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(28px)", transition: "opacity 1s ease, transform 1s ease" }}>
        <div style={{ width: 1, height: 52, background: `linear-gradient(to bottom, transparent, rgba(255,176,84,0.5))`, margin: "0 auto 30px" }} />
        <p style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 500, letterSpacing: "0.3em", textTransform: "uppercase", color: T.orange, marginBottom: 14 }}>Begin Your Journey</p>
        <h2 style={{ fontFamily: T.serif, fontSize: "clamp(32px, 6vw, 52px)", fontWeight: 400, fontStyle: "italic", color: T.text, lineHeight: 1.2, margin: "0 0 18px" }}>Plan Your Escape</h2>
        <p style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 300, color: T.mid, lineHeight: 1.9, marginBottom: 44 }}>
          Message us on Facebook and we'll help craft the perfect highland getaway. Our team responds within 24 hours.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 52 }}>
          <CTABtn iconLeft={<Mail size={14} />} style={{ padding: "14px 34px" }}>Message Us Now</CTABtn>
          <a href="tel:+639510265165"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: T.sans, fontSize: 11, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: T.mid, textDecoration: "none", padding: "14px 30px", borderRadius: 50, border: `1px solid ${T.stone}`, background: T.card, transition: "all 0.25s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderHov; e.currentTarget.style.color = T.orange; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.stone; e.currentTarget.style.color = T.mid; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <Phone size={14} /> 0951 026 5165
          </a>
        </div>

        <div style={{ height: 1, background: T.stone, marginBottom: 32 }} />
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px 28px" }}>
          {[
            { icon: <Phone size={12} />,    text: "0951 026 5165",          href: "tel:+639510265165" },
            { icon: <Mail size={12} />,     text: "villarecurso@gmail.com", href: "mailto:villarecurso@gmail.com" },
            { icon: <Facebook size={12} />, text: "VillaRecurso",           href: "https://www.facebook.com/VillaRecurso" },
            { icon: <MapPin size={12} />,   text: "Purok 2, Kapatagan, Digos City" },
          ].map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: `${T.orange}99`, flexShrink: 0 }}>{c.icon}</span>
              {c.href ? (
                <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                  style={{ fontFamily: T.sans, fontSize: 12, color: T.light, textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = T.orange}
                  onMouseLeave={e => e.currentTarget.style.color = T.light}
                >{c.text}</a>
              ) : (
                <span style={{ fontFamily: T.sans, fontSize: 12, color: T.light }}>{c.text}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────── Footer Bar ─────────────────────────── */
function FooterBar() {
  return (
    <footer style={{ background: T.text, padding: "22px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src="public/logo.png" alt="Villa Recurso" style={{ height: 26, opacity: 0.55 }} />
        <span style={{ fontFamily: T.sans, fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>Villa Recurso</span>
      </div>
      <p style={{ fontFamily: T.sans, fontSize: 11, color: "rgba(255,255,255,0.22)", margin: 0 }}>
        © {new Date().getFullYear()} Villa Recurso Resort · Kapatagan, Digos City
      </p>
      <a href="https://www.facebook.com/VillaRecurso" target="_blank" rel="noopener noreferrer"
        style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: T.sans, fontSize: 11, color: "rgba(255,255,255,0.35)", textDecoration: "none", transition: "color 0.2s" }}
        onMouseEnter={e => e.currentTarget.style.color = T.orange}
        onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
      >
        <Facebook size={13} /> Facebook
      </a>
    </footer>
  );
}

/* ────────────────────────── App Root ───────────────────────────── */
export default function App() {
  return (
    <>
      <FontLoader />
      <Nav />
      <main style={{ margin: 0, padding: 0 }}>
        <Hero />
        <StatsStrip />
        <Accommodations />
        {/* ── Live availability calendar pulled from Google Calendar ── */}
        <AvailabilityCalendar />
        <Gallery />
        <Location />
        <Contact />
        <FooterBar />
      </main>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { margin: 0; padding: 0; width: 100%; overflow-x: hidden; }
        html  { scroll-behavior: smooth; }
        body  { background: ${T.bg}; -webkit-font-smoothing: antialiased; }
        ::-webkit-scrollbar       { width: 5px; }
        ::-webkit-scrollbar-track { background: ${T.surface}; }
        ::-webkit-scrollbar-thumb { background: ${T.orange}; border-radius: 4px; }
        ::selection               { background: rgba(255,176,84,0.2); }
        img { display: block; max-width: 100%; user-select: none; -webkit-user-drag: none; }
        a   { cursor: pointer; }
        @media (max-width: 640px) { .room-text-col { padding: 28px 24px !important; } }
      `}</style>
    </>
  );
}