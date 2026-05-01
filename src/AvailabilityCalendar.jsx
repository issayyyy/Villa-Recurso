/**
 * Villa Recurso — Room Availability Calendar
 * ─────────────────────────────────────────────
 * • Horizontally-scrollable room filter bar
 * • Fetches live events from Google Calendar API
 * • Booked dates → soft red  |  Available dates → soft green
 * • Mobile-first premium design
 * • Messenger CTA with pre-filled room message
 *
 * Env var required:
 *   VITE_GOOGLE_API_KEY  (in .env locally, and Netlify environment variables)
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MessageCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";

/* ─────────────────────── Room catalogue ────────────────────────── */
const ROOMS = [
  {
    name: "Arch Cabin 1",
    id: "947241afbd61d5ce8f3674ad296e93a94caf1c80c921a5118daa2c625b33ee97@group.calendar.google.com",
  },
  {
    name: "Arch Cabin 2",
    id: "09ef56652d14e3257189fb858fe3246f019f5e9eb24d96d0d499e3e145e0f953@group.calendar.google.com",
  },
  {
    name: "Octatel - Room A",
    id: "c4e548f2cd48374128e49ee98df744cde6b3fe9a20f7741a0634a10d187b79f7@group.calendar.google.com",
  },
  {
    name: "Octatel - Room B",
    id: "30cccdfaff4dad4fa0a7788c3bfce8b561fa8d7a71c93a86c3b7bea962c03406@group.calendar.google.com",
  },
  {
    name: "Octatel - Room C",
    id: "3c8b022d9364b7301ca8a2d1646ddb01676aa9055906d0f4f4df194f9f68bc8e@group.calendar.google.com",
  },
  {
    name: "Japanese Dojo",
    id: "8d46800ca76cbf47e16a592a04e1729347c1fce6ac025f8b9a719d92a5bfe703@group.calendar.google.com",
  },
  {
    name: "Family Villa",
    id: "3806586db089e761925eaf9c1e0c334fe157a4f0518eda5ecdc8f6a1a4e46d30@group.calendar.google.com",
  },
];

/* ─────────────────────── Design tokens ────────────────────────── */
const T = {
  bg:          "#FAFAF8",
  surface:     "#F5F3EF",
  card:        "#FFFFFF",
  stone:       "#EAE7E1",
  stoneLight:  "#F0EDE8",
  text:        "#1A1815",
  mid:         "#5A5550",
  light:       "#9A9490",
  orange:      "#ffb054",
  yellow:      "#ffd737",
  serif:       "'Playfair Display', Georgia, serif",
  sans:        "'Poppins', system-ui, sans-serif",
  greenBg:     "rgba(22, 163, 74, 0.08)",
  greenText:   "#15803d",
  greenBorder: "rgba(22, 163, 74, 0.25)",
  redBg:       "rgba(220, 38, 38, 0.08)",
  redText:     "#b91c1c",
  redBorder:   "rgba(220, 38, 38, 0.22)",
};

/* ─────────────────────── Calendar helpers ──────────────────────── */
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_LABELS_FULL  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DAY_LABELS_SHORT = ["S","M","T","W","T","F","S"];

function toLocalKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function expandEvent(ev) {
  const entries  = [];
  const rawStart = ev.start?.date || ev.start?.dateTime;
  const rawEnd   = ev.end?.date   || ev.end?.dateTime;
  if (!rawStart) return entries;

  const summary  = (ev.summary || "Booked").trim();
  const isAllDay = !!ev.start?.date;
  const start    = new Date(rawStart);
  const end      = new Date(rawEnd || rawStart);

  // GCal all-day end date is exclusive — subtract 1 day so
  // the checkout date stays green (not marked as booked).
  if (isAllDay) end.setDate(end.getDate() - 1);

  const cursor = new Date(start);
  while (cursor <= end) {
    entries.push({ key: toLocalKey(cursor), summary });
    cursor.setDate(cursor.getDate() + 1);
  }
  return entries;
}

/* ─────────────────────── Main Component ───────────────────────── */
export default function AvailabilityCalendar() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [activeIdx,     setActiveIdx]     = useState(0);
  const [year,          setYear]          = useState(today.getFullYear());
  const [month,         setMonth]         = useState(today.getMonth());
  const [bookedMap,     setBookedMap]     = useState({});
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);
  const [transitioning, setTransitioning] = useState(false);

  const activeRoom = ROOMS[activeIdx];

  /* ── Fetch events from Google Calendar API ─────────────────────── */
  const fetchEvents = useCallback(async (roomId, yr, mo) => {
    setLoading(true);
    setError(null);

    const API_KEY =
      (typeof import.meta !== "undefined" && import.meta.env?.VITE_GOOGLE_API_KEY) ||
      (typeof process     !== "undefined" && process.env?.REACT_APP_GOOGLE_API_KEY) ||
      "";

    if (!API_KEY) {
      setError(
        "API key not found. Make sure VITE_GOOGLE_API_KEY is set in your .env file."
      );
      setLoading(false);
      return;
    }

    const timeMin = new Date(yr, mo, 1).toISOString();
    const timeMax = new Date(yr, mo + 1, 1).toISOString();

    const url = new URL(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(roomId)}/events`
    );
    url.searchParams.set("key",          API_KEY);
    url.searchParams.set("timeMin",      timeMin);
    url.searchParams.set("timeMax",      timeMax);
    url.searchParams.set("singleEvents", "true");
    url.searchParams.set("orderBy",      "startTime");
    url.searchParams.set("maxResults",   "250");

    try {
      const res  = await fetch(url.toString());
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body?.error?.message ||
          `HTTP ${res.status} — make sure the calendar is set to public.`
        );
      }
      const data  = await res.json();
      const items = data.items || [];

      const map = {};
      items.forEach(ev => {
        expandEvent(ev).forEach(({ key, summary }) => {
          map[key] = map[key] ? `${map[key]}, ${summary}` : summary;
        });
      });
      setBookedMap(map);
    } catch (err) {
      setError(err.message || "Could not load calendar. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  /* Re-fetch whenever room or month changes */
  useEffect(() => {
    fetchEvents(activeRoom.id, year, month);
  }, [activeRoom.id, year, month, fetchEvents]);

  /* ── Room switch with fade transition ──────────────────────────── */
  function switchRoom(idx) {
    if (idx === activeIdx) return;
    setTransitioning(true);
    setTimeout(() => {
      setActiveIdx(idx);
      setBookedMap({});
      setError(null);
      setTransitioning(false);
    }, 180);
  }

  /* ── Month navigation ──────────────────────────────────────────── */
  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  /* ── Build calendar grid ───────────────────────────────────────── */
  const firstDow   = new Date(year, month, 1).getDay();
  const daysInMo   = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstDow + daysInMo) / 7) * 7;
  const cells      = Array.from({ length: totalCells }, (_, i) => {
    const d = i - firstDow + 1;
    return d >= 1 && d <= daysInMo ? d : null;
  });

  /* ── Counts for legend ─────────────────────────────────────────── */
  const bookedThisMonth = Object.keys(bookedMap).filter(k => {
    const [ky, km] = k.split("-").map(Number);
    return ky === year && km - 1 === month;
  }).length;
  const availableThisMonth = daysInMo - bookedThisMonth;

  /* ── Messenger pre-filled link ─────────────────────────────────── */
  const messengerMsg = encodeURIComponent(
    `Hi! I'd like to inquire about the ${activeRoom.name} at Villa Recurso. Is it available for my desired dates?`
  );
  const messengerURL = `https://m.me/VillaRecurso?text=${messengerMsg}`;

  /* ──────────────────────────── Render ─────────────────────────── */
  return (
    <section
      id="availability"
      style={{
        background: T.bg,
        padding: "96px 0 104px",
        borderTop: `1px solid ${T.stone}`,
      }}
    >
      {/* ── Section heading ── */}
      <div style={{ textAlign: "center", padding: "0 24px", marginBottom: 44 }}>
        <p style={{
          fontFamily: T.sans, fontSize: 10, fontWeight: 600,
          letterSpacing: "0.3em", textTransform: "uppercase",
          color: T.orange, marginBottom: 10,
        }}>
          Live Availability
        </p>
        <div style={{
          width: 28, height: 1,
          background: `linear-gradient(90deg, ${T.orange}, ${T.yellow})`,
          margin: "0 auto 18px",
        }} />
        <h2 style={{
          fontFamily: T.serif,
          fontSize: "clamp(26px, 4vw, 40px)",
          fontWeight: 500, color: T.text,
          margin: "0 0 12px", lineHeight: 1.25,
        }}>
          Check Room Availability
        </h2>
        <p style={{
          fontFamily: T.sans, fontSize: 13.5, fontWeight: 300,
          color: T.mid, lineHeight: 1.85,
          maxWidth: 460, margin: "0 auto",
        }}>
          Select a room, browse open dates, then message us to lock in your highland escape.
        </p>
      </div>

      {/* ── Room filter bar ── */}
      <div style={{ position: "relative", marginBottom: 32 }}>
        {/* Scroll fade masks */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 32, zIndex: 2,
          background: `linear-gradient(to right, ${T.bg}, transparent)`,
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: 32, zIndex: 2,
          background: `linear-gradient(to left, ${T.bg}, transparent)`,
          pointerEvents: "none",
        }} />

        <div
          style={{
            display: "flex",
            gap: 10,
            overflowX: "auto",
            padding: "4px 28px 12px",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {ROOMS.map((room, idx) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={room.id}
                onClick={() => switchRoom(idx)}
                style={{
                  flexShrink: 0,
                  padding: "9px 20px",
                  borderRadius: 50,
                  border: isActive
                    ? `1.5px solid ${T.orange}`
                    : `1.5px solid ${T.stone}`,
                  background: isActive
                    ? `linear-gradient(135deg, ${T.orange}, ${T.yellow})`
                    : T.card,
                  color: isActive ? T.text : T.mid,
                  fontFamily: T.sans,
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 500,
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: isActive
                    ? "0 4px 16px rgba(255,176,84,0.35)"
                    : "0 1px 4px rgba(0,0,0,0.05)",
                  transform: isActive ? "translateY(-1px)" : "translateY(0)",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = T.orange;
                    e.currentTarget.style.color       = T.orange;
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = T.stone;
                    e.currentTarget.style.color       = T.mid;
                  }
                }}
              >
                {room.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Calendar card ── */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 16px" }}>
        <div style={{
          background: T.card,
          borderRadius: 24,
          border: `1px solid ${T.stone}`,
          boxShadow: "0 8px 48px rgba(0,0,0,0.07)",
          overflow: "hidden",
          opacity:   transitioning ? 0 : 1,
          transform: transitioning ? "translateY(6px)" : "translateY(0)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
        }}>

          {/* Month navigation bar */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px 16px",
            background: T.surface,
            borderBottom: `1px solid ${T.stone}`,
            gap: 10, flexWrap: "wrap",
          }}>
            <NavBtn onClick={prevMonth} aria="Previous month">
              <ChevronLeft size={17} />
            </NavBtn>

            <div style={{ textAlign: "center", flex: 1, minWidth: 180 }}>
              <h3 style={{
                fontFamily: T.serif,
                fontSize: "clamp(16px, 2.5vw, 20px)",
                fontWeight: 500, color: T.text,
                margin: "0 0 8px", lineHeight: 1,
              }}>
                {MONTH_NAMES[month]} {year}
              </h3>
              <div style={{
                display: "flex", gap: 8,
                justifyContent: "center", flexWrap: "wrap",
              }}>
                <LegendPill color="green" count={availableThisMonth} label="Available" />
                <LegendPill color="red"   count={bookedThisMonth}    label="Booked"    />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <NavBtn
                onClick={() => fetchEvents(activeRoom.id, year, month)}
                aria="Refresh"
                spinning={loading}
              >
                <RefreshCw size={14} />
              </NavBtn>
              <NavBtn onClick={nextMonth} aria="Next month">
                <ChevronRight size={17} />
              </NavBtn>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "12px 20px",
              background: "rgba(220,38,38,0.05)",
              borderBottom: `1px solid rgba(220,38,38,0.15)`,
            }}>
              <AlertCircle size={14} style={{ color: T.redText, flexShrink: 0, marginTop: 1 }} />
              <p style={{
                fontFamily: T.sans, fontSize: 11.5,
                color: T.redText, margin: 0, lineHeight: 1.6,
              }}>
                {error}
              </p>
              <button
                onClick={() => fetchEvents(activeRoom.id, year, month)}
                style={{
                  marginLeft: "auto", flexShrink: 0,
                  background: "none", border: "none",
                  fontFamily: T.sans, fontSize: 11, fontWeight: 600,
                  color: T.redText, cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Day of week headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            padding: "12px 12px 4px",
            borderBottom: `1px solid ${T.stoneLight}`,
          }}>
            {DAY_LABELS_FULL.map((d, i) => (
              <div key={d} style={{
                textAlign: "center",
                fontFamily: T.sans, fontSize: 10, fontWeight: 600,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: T.light, padding: "3px 0",
              }}>
                <span className="vr-day-full">{d}</span>
                <span className="vr-day-short">{DAY_LABELS_SHORT[i]}</span>
              </div>
            ))}
          </div>

          {/* Calendar date grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "2px",
            padding: "8px 8px 16px",
            opacity: loading ? 0.4 : 1,
            transition: "opacity 0.3s ease",
            pointerEvents: loading ? "none" : "auto",
          }}>
            {cells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;

              const key = [
                year,
                String(month + 1).padStart(2, "0"),
                String(day).padStart(2, "0"),
              ].join("-");

              const cellDate = new Date(year, month, day);
              const isPast   = cellDate < today;
              const isToday  = toLocalKey(cellDate) === toLocalKey(today);
              const evTitle  = bookedMap[key];
              const isBooked = !!evTitle;

              return (
                <DayCell
                  key={key}
                  day={day}
                  isToday={isToday}
                  isPast={isPast}
                  isBooked={isBooked}
                  eventTitle={evTitle}
                />
              );
            })}
          </div>

          {/* Loading indicator */}
          {loading && (
            <div style={{
              textAlign: "center", paddingBottom: 16,
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: 7,
              fontFamily: T.sans, fontSize: 11.5, color: T.light,
            }}>
              <RefreshCw size={12} style={{ animation: "vrSpin 0.9s linear infinite" }} />
              Loading {activeRoom.name}…
            </div>
          )}
        </div>

        {/* ── Messenger CTA card ── */}
        <div style={{
          marginTop: 20,
          padding: "24px",
          borderRadius: 20,
          background: T.card,
          border: `1px solid ${T.stone}`,
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          textAlign: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar size={14} style={{ color: T.orange }} />
            <span style={{
              fontFamily: T.sans, fontSize: 12,
              color: T.mid, fontWeight: 400,
            }}>
              Viewing availability for{" "}
              <strong style={{ color: T.text }}>{activeRoom.name}</strong>
            </span>
          </div>

          <p style={{
            fontFamily: T.sans, fontSize: 12.5, fontWeight: 300,
            color: T.mid, lineHeight: 1.75,
            maxWidth: 400, margin: 0,
          }}>
            Found a date that works? Message us on Messenger and we'll
            confirm your reservation right away.
          </p>

          <a
            href={messengerURL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 9,
              fontFamily: T.sans, fontSize: 11.5, fontWeight: 600,
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: T.text, textDecoration: "none",
              padding: "13px 28px", borderRadius: 50,
              background: `linear-gradient(135deg, ${T.orange}, ${T.yellow})`,
              boxShadow: "0 4px 18px rgba(255,176,84,0.32)",
              transition: "transform 0.25s ease, box-shadow 0.25s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(255,176,84,0.48)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 18px rgba(255,176,84,0.32)";
            }}
          >
            <MessageCircle size={15} />
            Inquire about {activeRoom.name} on Messenger
          </a>
        </div>
      </div>

      {/* Scoped global styles */}
      <style>{`
        @keyframes vrSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        /* Full day labels on tablet+, single letter on mobile */
        .vr-day-full  { display: none;   }
        .vr-day-short { display: inline; }
        @media (min-width: 480px) {
          .vr-day-full  { display: inline; }
          .vr-day-short { display: none;   }
        }
        /* Hide filter bar scrollbar on webkit */
        .vr-filter-bar::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}

/* ─────────────────────── Sub-components ───────────────────────── */

function NavBtn({ onClick, aria, children, spinning = false }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      aria-label={aria}
      disabled={spinning}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 36, height: 36, borderRadius: "50%",
        border: `1.5px solid ${hov ? T.orange : T.stone}`,
        background: hov ? "rgba(255,176,84,0.06)" : T.card,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: spinning ? "wait" : "pointer",
        color: hov ? T.orange : T.mid,
        flexShrink: 0,
        transition: "all 0.2s ease",
        animation: spinning ? "vrSpin 0.9s linear infinite" : "none",
      }}
    >
      {children}
    </button>
  );
}

function LegendPill({ color, count, label }) {
  const isGreen = color === "green";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 50,
      fontFamily: T.sans, fontSize: 10, fontWeight: 500,
      background: isGreen ? T.greenBg    : T.redBg,
      color:      isGreen ? T.greenText  : T.redText,
      border:     `1px solid ${isGreen ? T.greenBorder : T.redBorder}`,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: isGreen ? T.greenText : T.redText,
        flexShrink: 0,
      }} />
      {count > 0 && <strong>{count}</strong>} {label}
    </span>
  );
}

function DayCell({ day, isToday, isPast, isBooked, eventTitle }) {
  const [hov, setHov] = useState(false);

  const pillLabel = isBooked
    ? ((eventTitle?.length ?? 0) > 12
        ? eventTitle.slice(0, 11) + "…"
        : eventTitle)
    : "Available";

  const pillStyle = isBooked
    ? { bg: T.redBg,   text: T.redText,   border: T.redBorder   }
    : { bg: T.greenBg, text: T.greenText, border: T.greenBorder };

  return (
    <div
      onMouseEnter={() => !isPast && setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={!isPast ? (isBooked ? eventTitle : "Available") : ""}
      style={{
        padding: "6px 3px",
        borderRadius: 10,
        background: hov && !isPast
          ? isBooked
            ? "rgba(220,38,38,0.04)"
            : "rgba(22,163,74,0.04)"
          : "transparent",
        transition: "background 0.18s ease",
        minHeight: 68,
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 5,
      }}
    >
      {/* Day number */}
      <span style={{
        fontFamily: T.sans,
        fontSize: "clamp(11px, 2vw, 13px)",
        fontWeight: isToday ? 700 : 400,
        lineHeight: 1,
        color: isToday ? T.orange : isPast ? T.stone : T.text,
      }}>
        {day}
      </span>

      {/* Today dot */}
      {isToday && (
        <div style={{
          width: 4, height: 4, borderRadius: "50%",
          background: T.orange, marginTop: -2,
        }} />
      )}

      {/* Status pill — hidden for past dates */}
      {!isPast && (
        <span style={{
          fontFamily: T.sans,
          fontSize: "clamp(7px, 1.5vw, 9px)",
          fontWeight: 600,
          padding: "2px 5px",
          borderRadius: 50,
          background:    pillStyle.bg,
          color:         pillStyle.text,
          border:        `1px solid ${pillStyle.border}`,
          textAlign:     "center",
          lineHeight:    1.3,
          maxWidth:      "100%",
          overflow:      "hidden",
          textOverflow:  "ellipsis",
          whiteSpace:    "nowrap",
          display:       "block",
        }}>
          {pillLabel}
        </span>
      )}
    </div>
  );
}