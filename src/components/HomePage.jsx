import React, { useState, useEffect, useRef } from "react";
import {
  Target,
  Users,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  Sparkles,
  Calendar,
  FileText,
} from "lucide-react";
import mainIco from "../assets/icons/main-ico.svg"; // added

// Props: user, onEnter (go to dashboard), onLogin, onRegister
export const HomePage = ({ user, onEnter, onLogin, onRegister }) => {
  const [scrollY, setScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const parallaxOffset = scrollY * 0.25;

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 transition-colors">
      {/* Navigation (glass) */}
      <nav className="fixed top-0 w-full z-50">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="glass flex items-center justify-between rounded-xl px-5 py-3">
            <div className="flex items-center space-x-3">
              <div className="neo-icon w-11 h-11 flex items-center justify-center rounded-xl">
                <img src={mainIco} alt="Neutral logo" className="w-6 h-6" />
              </div>
              <span className="font-semibold text-xl tracking-wide">Neutral</span>
            </div>

            <div className="hidden md:flex items-center space-x-10 text-sm">
              <a href="#features" className="nav-link">Features</a>
              <a href="#about" className="nav-link">About</a>
              {/* <a href="#pricing" className="nav-link">Pricing</a> */}
              {!user && (
                <>
                  <button onClick={onLogin} className="btn-ghost">Login</button>
                  <button onClick={onRegister} className="btn-primary">Get Started</button>
                </>
              )}
              {user && (
                <button onClick={onEnter} className="btn-primary">Dashboard</button>
              )}
            </div>

            <button
              className="md:hidden neo-icon w-10 h-10 flex items-center justify-center rounded-lg"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="mt-3 mx-6 md:hidden glass rounded-xl p-4 space-y-4 text-sm">
              <a href="#features" className="block nav-link">Features</a>
              <a href="#about" className="block nav-link">About</a>
              <a href="#pricing" className="block nav-link">Pricing</a>
              {!user && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button onClick={onLogin} className="btn-ghost w-full">Login</button>
                  <button onClick={onRegister} className="btn-primary w-full">Register</button>
                </div>
              )}
              {user && (
                <button onClick={onEnter} className="btn-primary w-full">Go to Dashboard</button>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section
        ref={heroRef}
        className="pt-32 pb-24"
        style={{ transform: `translateY(${parallaxOffset * 0.6}px)` }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 text-xs tracking-wide rounded-full glass-soft mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Neutral · Clean productivity</span>
          </div>

            <h1 className="text-5xl md:text-6xl font-semibold leading-tight mb-6">
              Organize work.
              <br />
              <span className="font-light">Deliver clarity.</span>
            </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 font-light">
            Minimal project coordination platform. Tasks, goals, and collaboration in a distraction‑free interface.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!user && (
              <>
                <button onClick={onRegister} className="btn-primary group">
                  <span>Start free</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
                <button onClick={onLogin} className="btn-ghost">
                  Login
                </button>
              </>
            )}
            {user && (
              <button onClick={onEnter} className="btn-primary group">
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            )}
          </div>

          {user && (
            <div className="mt-6 text-xs tracking-wide opacity-70">
              Signed in as <span className="font-medium">{user.username}</span> ({user.role})
            </div>
          )}
        </div>

        {/* Preview panel */}
        <div className="mt-20 max-w-5xl mx-auto px-6">
          <div className="preview-panel rounded-2xl p-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="glass p-5 rounded-xl">
                <Target className="w-7 h-7 mb-4 text-[##D35A5C]" style={{ color: "#D35A5C" }} />
                <h3 className="font-semibold mb-2">Objectives</h3>
                <p className="text-sm leading-relaxed">
                  Link tasks to clear quarterly goals.
                </p>
              </div>
              <div className="glass p-5 rounded-xl">
                <BarChart3 className="w-7 h-7 mb-4" style={{ color: "#D35A5C" }} />
                <h3 className="font-semibold mb-2">Progress</h3>
                <p className="text-sm leading-relaxed">
                  Lightweight metrics for velocity and completion.
                </p>
              </div>
              <div className="glass p-5 rounded-xl">
                <Users className="w-7 h-7 mb-4" style={{ color: "#D35A5C" }} />
                <h3 className="font-semibold mb-2">Collaboration</h3>
                <p className="text-sm leading-relaxed">
                  Centralized updates without noise.
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="pb-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold">Core Features</h2>
            <p className="mt-3 text-sm md:text-base opacity-70 font-light">
              Focused building blocks for structured delivery.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Calendar, title: "Timeline", desc: "Visual scheduling." },
              { icon: FileText, title: "Docs", desc: "Inline specifications." },
              { icon: CheckCircle2, title: "Tasks", desc: "Atomic work units." },
              { icon: BarChart3, title: "Analytics", desc: "Outcome snapshots." },
            ].map((f, i) => (
              <div key={i} className="feature-card glass flex flex-col p-6 rounded-xl">
                <div className="neo-icon w-12 h-12 flex items-center justify-center rounded-lg mb-4">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-medium mb-2">{f.title}</h3>
                <p className="text-sm opacity-70 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="glass rounded-2xl p-12">
            <h2 className="text-3xl font-semibold mb-4">Start in minutes</h2>
            <p className="text-sm md:text-base font-light opacity-70 mb-8">
              Create a workspace and begin structuring your delivery pipeline.
            </p>
            {!user && (
              <button onClick={onRegister} className="btn-primary group">
                <span>Create workspace</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            )}
            {user && (
              <button onClick={onEnter} className="btn-primary group">
                <span>Enter dashboard</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            )}
          </div>
        </div>
      </section>

    {/* Footer */}
    <footer className="mt-8 border-t border-black/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="neo-icon w-11 h-11 flex items-center justify-center rounded-xl">
                        <img src={mainIco} alt="Neutral logo" className="w-6 h-6" />
                    </div>
                    <span className="font-semibold text-lg">Neutral</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                    <div className="space-y-3 grid pr-4">
                        <div className="font-medium">Product</div>
                        <a href="#features" className="nav-link">Features</a>
                        <a href="#about" className="nav-link">About</a>
                    </div>
                    <div className="space-y-2 grid">
                        <div className="font-medium">Resources</div>
                        <a href="#" className="nav-link">Docs</a>
                        <a href="#" className="nav-link">Support</a>
                    </div>
                    <div className="space-y-2">
                        <div className="font-medium">Account</div>
                        {!user ? (
                            <div className="flex gap-2">
                                <button onClick={onLogin} className="btn-ghost">Login</button>
                                <button onClick={onRegister} className="btn-primary">Sign up</button>
                            </div>
                        ) : (
                            <button onClick={onEnter} className="btn-primary">Dashboard</button>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs opacity-70">
                <p>© {new Date().getFullYear()} Neutral. All rights reserved.</p>
                <div className="flex items-center gap-4">
                    <a href="#" className="nav-link">Privacy</a>
                    <a href="#" className="nav-link">Terms</a>
                    <a href="#" className="nav-link">Contact</a>
                </div>
            </div>
        </div>
    </footer>

    {/* Styles */}}
      <style>{`
        .glass {
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,0.35);
          box-shadow: 0 8px 36px -12px rgba(0,0,0,0.15);
        }
        .glass-soft {
          background: rgba(255,255,255,0.4);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.3);
        }
        .preview-panel {
          background: rgba(0,0,0,1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow:
            0 8px 28px -10px rgba(0,0,0,0.18),
            0 2px 6px rgba(0,0,0,0.05);
        }
        .dark .preview-panel {
          background: rgba(20,20,20,0.85);
          border-color: rgba(255,255,255,0.08);
          box-shadow:
            0 8px 28px -10px rgba(0,0,0,0.6),
            0 2px 6px rgba(0,0,0,0.7);
        }
        .neo-tile {
          background:rgba(0,255,255,0.12);
          box-shadow:
            6px 6px 14px rgba(0,0,0,0.10),
            -6px -6px 14px rgba(255,255,255,0.85);
        }
        .dark .neo-tile {
          background:#161616;
          box-shadow:
            6px 6px 14px rgba(0,0,0,0.7),
            -6px -6px 14px rgba(255,255,255,0.04);
        }
        .neo-icon {
          background: #ededed;
          box-shadow:
            inset 3px 3px 6px rgba(0,0,0,0.12),
            inset -3px -3px 6px rgba(255,255,255,0.7);
        }
        .dark .neo-icon {
          background: #222;
          box-shadow:
            inset 3px 3px 6px rgba(0,0,0,0.6),
            inset -3px -3px 6px rgba(255,255,255,0.07);
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: .6rem;
          padding: .85rem 1.6rem;
          border-radius: 999px;
          font-size: .9rem;
          font-weight: 500;
          background: linear-gradient(145deg,#fff,#e6e6e6);
          color:#111;
          box-shadow:
            4px 4px 10px rgba(0,0,0,0.15),
            -4px -4px 10px rgba(255,255,255,0.7);
          transition: all .25s;
        }
        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow:
            6px 6px 14px rgba(0,0,0,0.18),
            -6px -6px 14px rgba(255,255,255,0.75);
        }
        .btn-ghost {
          padding: .85rem 1.4rem;
          border-radius: 999px;
          font-size: .85rem;
          font-weight: 500;
          background: #fff;
          border: 1px solid #d9d9d9;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
          transition: all .25s;
        }
        .btn-ghost:hover { background:#f5f5f5; }
        .nav-link {
          position: relative;
        }
        .nav-link::after {
          content:"";
          position:absolute;
          left:0;
          bottom:-6px;
          width:0;
          height:1px;
          background:#111;
          transition:width .25s;
        }
        .nav-link:hover::after { width:100%; }
        @media (prefers-color-scheme: dark) {
          .glass, .glass-soft {
            background: rgba(30,30,30,0.55);
            border-color: rgba(255,255,255,0.12);
          }
          .btn-primary {
            background: linear-gradient(145deg,#2a2a2a,#1e1e1e);
            color:#eee;
            box-shadow:
              4px 4px 10px rgba(0,0,0,0.6),
              -4px -4px 10px rgba(255,255,255,0.05);
          }
          .btn-primary:hover {
            box-shadow:
              6px 6px 14px rgba(0,0,0,0.65),
              -6px -6px 14px rgba(255,255,255,0.06);
          }
          .btn-ghost {
            background:#1e1e1e;
            border-color:#333;
            color:#ddd;
          }
          .btn-ghost:hover { background:#262626; }
          .nav-link::after { background:#ddd; }
        }
      `}</style>
    </div>
  );
};