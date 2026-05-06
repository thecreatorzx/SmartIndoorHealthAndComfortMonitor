import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'

// ─── tiny hook: fade-in on scroll ───────────────────────────────────────────
function useFadeIn() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('opacity-100', 'translate-y-0')
        }
      },
      { threshold: 0.15 }
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return ref
}

// ─── stat pill ──────────────────────────────────────────────────────────────
const Stat = ({ value, label }) => (
  <div className="flex flex-col items-center px-8 py-5 border-r border-white/10 last:border-r-0 sm:px-10 sm:py-6 md:px-14">
    <span className="text-[1.75rem] sm:text-[2rem] font-semibold leading-none bg-linear-to-br from-cyan-400 to-blue-500 bg-clip-text text-transparent font-['Cormorant_Garamond',serif]">
      {value}
    </span>
    <span className="mt-1 text-[0.7rem] sm:text-[0.75rem] tracking-[0.06em] text-slate-400 text-center">
      {label}
    </span>
  </div>
)

// ─── feature card ───────────────────────────────────────────────────────────
const Feature = ({ icon, title, desc }) => {
  const ref = useFadeIn()

  return (
    <div
      ref={ref}
      className="opacity-0 translate-y-5 transition-all duration-700 ease-out bg-white/6 border border-white/10 rounded-[1.25rem] p-6 sm:p-8 hover:-translate-y-0.75 hover:border-blue-500/35"
    >
      <div className="mb-4 text-[1.75rem]">{icon}</div>
      <h3 className="mb-2 text-[1.1rem] sm:text-[1.25rem] font-semibold font-['Cormorant_Garamond',serif]">
        {title}
      </h3>
      <p className="text-sm leading-6 font-light text-slate-400">
        {desc}
      </p>
    </div>
  )
}

// ─── landing ────────────────────────────────────────────────────────────────
export default function Landing({ user }) {
  const navigate = useNavigate()
  const ref1 = useFadeIn()
  const ref2 = useFadeIn()
  const ref3 = useFadeIn()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes heroIn {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        className="overflow-x-hidden bg-[#0a0f1e] text-[#f8fafc]"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* ── nav ── */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 sm:px-10 sm:py-5 md:px-16 bg-linear-to-b from-[#0a0f1ef2] to-transparent backdrop-blur-sm">
          <div
            className="text-[1.2rem] sm:text-[1.4rem] font-semibold tracking-[0.04em] bg-linear-to-br from-cyan-400 via-blue-500 to-violet-600 bg-clip-text text-transparent"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            ComfortAI
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <button
                className="rounded-full border border-white/10 bg-transparent px-4 py-2 text-[0.8rem] sm:px-5 sm:text-[0.85rem] cursor-pointer transition hover:bg-white/6 hover:border-blue-500"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard →
              </button>
            ) : (
              <>
                <button
                  className="rounded-full border border-white/10 bg-transparent px-4 py-2 text-[0.8rem] sm:px-5 sm:text-[0.85rem] cursor-pointer transition hover:bg-white/6 hover:border-blue-500"
                  onClick={() => navigate('/login')}
                >
                  Sign in
                </button>
                <button
                  className="rounded-full border-0 bg-linear-to-br from-blue-500 to-violet-600 px-4 py-2 text-[0.8rem] sm:px-5 sm:text-[0.85rem] cursor-pointer transition hover:opacity-90"
                  onClick={() => navigate('/signup')}
                >
                  Get started
                </button>
              </>
            )}
          </div>
        </nav>

        {/* ── hero ── */}
        <section className="relative flex h-screen min-h-[600px] items-end pb-20 sm:pb-32">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/hero.jpg')" }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(10,15,30,0.92)_0%,rgba(10,15,30,0.65)_50%,rgba(10,15,30,0.30)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(10,15,30,0.98)_0%,transparent_55%)]" />

          <div
            className="relative z-[2] max-w-[90vw] sm:max-w-150 px-5 sm:px-16 animate-[heroIn_1.1s_cubic-bezier(0.16,1,0.3,1)_both]"
          >
            <div className="mb-4 sm:mb-5 inline-flex items-center gap-2 text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.18em] text-cyan-400">
              <span className="inline-block h-px w-5 sm:w-7 bg-cyan-400" />
              Real-time environmental intelligence
            </div>

            <h1
              className="mb-4 sm:mb-5 text-[clamp(2.2rem,7vw,4.2rem)] font-light leading-[1.12] tracking-[-0.01em]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Your room,<br />
              <em className="bg-linear-to-br from-cyan-400 to-blue-500 bg-clip-text italic text-transparent">
                perfectly safe
              </em>
              <br />
              to breathe in.
            </h1>

            <p className="mb-7 sm:mb-9 max-w-[85vw] sm:max-w-105 text-sm sm:text-base leading-6 sm:leading-7 font-light text-slate-400">
              ComfortAI Monitor tracks temperature, humidity, CO₂, noise, UV, and pressure
              in real time — so you always know if your space is healthy for the people in it.
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {user ? (
                <button
                  className="rounded-full border-0 bg-linear-to-br from-blue-500 to-violet-600 px-6 py-3 sm:px-8 sm:py-3.5 text-[0.9rem] sm:text-[0.95rem] cursor-pointer shadow-[0_0_40px_rgba(59,130,246,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_0_60px_rgba(59,130,246,0.45)]"
                  onClick={() => navigate('/dashboard')}
                >
                  Open Dashboard →
                </button>
              ) : (
                <>
                  <button
                    className="rounded-full border-0 bg-linear-to-br from-blue-500 to-violet-600 px-6 py-3 sm:px-8 sm:py-3.5 text-[0.9rem] sm:text-[0.95rem] cursor-pointer shadow-[0_0_40px_rgba(59,130,246,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_0_60px_rgba(59,130,246,0.45)]"
                    onClick={() => navigate('/signup')}
                  >
                    Start monitoring free
                  </button>
                  <button
                    className="rounded-full border border-white/10 bg-transparent px-6 py-3 sm:px-8 sm:py-3.5 text-[0.9rem] sm:text-[0.95rem] cursor-pointer transition hover:border-white/30 hover:bg-white/6"
                    onClick={() => navigate('/login')}
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── stats ── */}
        <div className="flex flex-wrap justify-center border-y border-white/10 bg-white/6">
          <Stat value="7"      label="Sensors tracked"  />
          <Stat value="< 500ms" label="Update latency"  />
          <Stat value="24 / 7" label="Live monitoring"  />
          <Stat value="ESP32"  label="Powered by"       />
        </div>

        {/* ── device section ── */}
        <section className="bg-[#0d1526] px-5 py-20 sm:px-10 sm:py-24 md:px-16 md:py-28">
          <div
            ref={ref1}
            className="mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-20 max-w-5xl opacity-0 translate-y-6 transition-all duration-700 ease-out"
          >
            <div className="overflow-hidden rounded-3xl aspect-4/3 shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
              <img
                src="/device.jpg"
                alt="ComfortAI sensor device"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-col gap-5 sm:gap-6">
              <p className="text-[0.72rem] uppercase tracking-[0.18em] text-cyan-400">
                The hardware
              </p>
              <h2
                className="text-[clamp(1.7rem,4vw,3rem)] font-light leading-[1.2]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                One small device.
                <br />
                Total room awareness.
              </h2>
              <p className="text-slate-400 font-light leading-7 text-sm sm:text-base">
                Your ESP32-powered sensor sits quietly on the wall, streaming live
                environmental data directly to your dashboard every second.
              </p>
              <ul className="flex list-none flex-col gap-3">
                {[
                  "Temperature & humidity via DHT22 sensor",
                  "CO₂ concentration for air quality awareness",
                  "UV index, light level, and barometric pressure",
                  "Noise level monitoring for sleep quality",
                  "Instant alerts when thresholds are breached",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[0.9rem] sm:text-[0.95rem] leading-[1.55] text-slate-400">
                    <span className="shrink-0 mt-[0.1rem] text-cyan-400 font-semibold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── features ── */}
        <section className="bg-[#0a0f1e] px-5 py-20 sm:px-10 sm:py-24 md:px-16 md:py-28">
          <div className="mx-auto max-w-5xl">
            <div
              ref={ref2}
              className="opacity-0 translate-y-6 transition-all duration-700 ease-out"
            >
              <p className="mb-3 text-[0.72rem] uppercase tracking-[0.18em] text-cyan-400">
                What it does
              </p>
              <h2
                className="mb-4 text-[clamp(1.7rem,4vw,3rem)] font-light leading-[1.2]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Intelligence built for comfort.
              </h2>
            </div>

            <div className="mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              <Feature icon="🌡️" title="Temperature"    desc="Know exactly when your room is too hot or too cold for comfortable rest." />
              <Feature icon="💧" title="Humidity"       desc="High humidity breeds mold. Low humidity cracks skin. Stay in the sweet spot." />
              <Feature icon="🌬️" title="CO₂ & Air Quality" desc="CO₂ above 1000 ppm hurts concentration. We alert you before it gets there." />
              <Feature icon="🔔" title="Smart Alerts"   desc="Threshold breaches trigger instant WebSocket alerts — no polling, no delay." />
              <Feature icon="📊" title="Live Dashboard" desc="Real-time charts, device status, and historical readings in one place." />
              <Feature icon="🌙" title="Sleep Guard"    desc="Noise and temperature monitoring designed to protect your sleep quality." />
            </div>
          </div>
        </section>

        {/* ── comfort image section ── */}
        <section className="relative flex min-h-[500px] sm:min-h-130 items-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/comfort.jpg')" }}
          />
          <div className="absolute inset-0 bg-[rgba(10,15,30,0.75)] md:bg-[linear-gradient(to_right,rgba(10,15,30,0.0)_0%,rgba(10,15,30,0.88)_55%,rgba(10,15,30,0.97)_100%)]" />

          <div
            ref={ref3}
            className="relative z-[2] w-full md:ml-auto flex md:max-w-120 flex-col gap-5 px-5 py-16 sm:px-10 sm:py-20 md:px-16 opacity-0 translate-y-6 transition-all duration-700 ease-out"
          >
            <p className="text-[0.72rem] uppercase tracking-[0.18em] text-cyan-400">
              Peace of mind
            </p>
            <h2
              className="text-[clamp(1.5rem,4vw,2.5rem)] font-light leading-[1.2]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Every green light means your room is cleared for comfort.
            </h2>
            <p className="text-slate-400 font-light leading-7 text-sm sm:text-base">
              ComfortAI continuously evaluates all sensor readings against
              human comfort standards. When everything checks out, you know —
              with certainty — that your space is safe.
            </p>

            {!user && (
              <button
                className="mt-2 self-start rounded-full border-0 bg-gradient-to-br from-blue-500 to-violet-600 px-7 py-3 sm:px-8 sm:py-3.5 text-[0.9rem] sm:text-[0.95rem] cursor-pointer shadow-[0_0_40px_rgba(59,130,246,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_0_60px_rgba(59,130,246,0.45)]"
                onClick={() => navigate('/signup')}
              >
                Start for free →
              </button>
            )}
          </div>
        </section>

        {/* ── CTA ── */}
        {!user && (
          <section className="px-5 py-20 sm:px-10 sm:py-28 md:py-32 text-center bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(59,130,246,0.08)_0%,transparent_70%)]">
            <h2
              className="mb-4 text-[clamp(1.7rem,5vw,3.5rem)] font-light leading-[1.2]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Ready to know your room
              <br />
              is safe to be in?
            </h2>
            <p className="mb-8 sm:mb-10 font-light text-slate-400 text-sm sm:text-base">
              Set up takes under 5 minutes. No subscription required.
            </p>

            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              <button
                className="rounded-full border-0 bg-gradient-to-br from-blue-500 to-violet-600 px-7 py-3 sm:px-8 sm:py-3.5 text-[0.9rem] sm:text-[0.95rem] cursor-pointer shadow-[0_0_40px_rgba(59,130,246,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_0_60px_rgba(59,130,246,0.45)]"
                onClick={() => navigate('/signup')}
              >
                Create free account
              </button>
              <button
                className="rounded-full border border-white/10 bg-transparent px-7 py-3 sm:px-8 sm:py-3.5 text-[0.9rem] sm:text-[0.95rem] cursor-pointer transition hover:border-white/30 hover:bg-white/[0.06]"
                onClick={() => navigate('/login')}
              >
                I already have an account
              </button>
            </div>
          </section>
        )}

        {/* ── footer ── */}
        <footer className="flex flex-col sm:flex-row items-center justify-between border-t border-white/10 px-5 py-6 sm:px-10 sm:py-8 md:px-16 text-[0.8rem] text-slate-400 gap-2 sm:gap-0 text-center sm:text-left">
          <div
            className="text-[1.1rem] bg-gradient-to-br from-cyan-400 to-violet-600 bg-clip-text text-transparent"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            ComfortAI Monitor
          </div>
          <div>Built with ESP32 · Node.js · React · WebSockets</div>
        </footer>
      </div>
    </>
  )
}