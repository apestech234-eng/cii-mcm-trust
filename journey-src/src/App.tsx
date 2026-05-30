import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { journeyData } from './data/journeyData';
import { ProgressIndicator } from './components/ProgressIndicator';
import { MilestoneCard } from './components/MilestoneSection';
import { ImpactStats } from './components/ImpactStats';
import { ArrowLeft, ArrowUp, MousePointer } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const App: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const pathRef = useRef<SVGPathElement>(null);

  // ViewBox coordinates (width = 1000, height = 8000)
  const svgWidth = 1000;
  const svgHeight = 8000;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Points along the path
  const points = journeyData.map((_, idx) => {
    // On mobile (<768px), swing wider (offset 300) so there's room for cards.
    // On desktop, swing normal (offset 150)
    const offset = isMobile ? 300 : 150;
    const x = 500 + (idx % 2 === 0 ? -offset : offset);
    const y = idx * 800 + 400; // Centered inside each 800 unit segment
    return { x, y };
  });

  // Construct winding Bezier curve spline
  let pathD = "M 500,0";
  points.forEach((pt, idx) => {
    const prevPt = idx === 0 ? { x: 500, y: 0 } : points[idx - 1];
    const cpY1 = prevPt.y + (pt.y - prevPt.y) / 2;
    const cpY2 = pt.y - (pt.y - prevPt.y) / 2;
    pathD += ` C ${prevPt.x},${cpY1} ${pt.x},${cpY2} ${pt.x},${pt.y}`;
  });
  pathD += ` L 500,${svgHeight}`;

  const scrollToSection = (index: number) => {
    if (index === journeyData.length) {
      const el = document.getElementById('impact-stats');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      const el = document.getElementById(`milestone-row-${index}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetY = scrollTop + rect.top - (window.innerHeight - rect.height) / 2;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    // Initialize dashoffset
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      gsap.set(pathRef.current, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });
    }

    const ctx = gsap.context(() => {
      // 1. Progressively draw the center timeline ribbon path on scroll
      if (pathRef.current) {
        gsap.to(pathRef.current, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: '.journey-ribbon-container',
            start: 'top 50%',
            end: 'bottom 50%',
            scrub: 0.5,
          },
        });
      }

      // 2. Track scroll position to update active checkpoint row
      journeyData.forEach((_, idx) => {
        ScrollTrigger.create({
          trigger: `#milestone-row-${idx}`,
          start: 'top 50%',
          end: 'bottom 50%',
          onEnter: () => setActiveIndex(idx),
          onEnterBack: () => setActiveIndex(idx),
          onLeaveBack: () => {
            if (idx === 0) setActiveIndex(-1);
          }
        });

        // 3. Parallax effect for card image
        gsap.fromTo(
          `.parallax-img-${idx}`,
          { y: '-10%', scale: 1.08 },
          {
            y: '10%',
            scale: 1.0,
            ease: 'none',
            scrollTrigger: {
              trigger: `#milestone-row-${idx}`,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      });

      // Stats Section indicator sync
      ScrollTrigger.create({
        trigger: '#impact-stats',
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (self) => {
          if (self.isActive) {
            setActiveIndex(journeyData.length);
          }
        },
      });
    });

    return () => {
      ctx.revert();
    };
  }, [isMobile]);

  return (
    <div className="bg-[#070a13] text-white w-full relative selection:bg-amber-500 selection:text-slate-950">
      
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-slate-950/70 backdrop-blur-md border-b border-white/5 z-40 flex items-center justify-between px-6 md:px-12 select-none">
        <a href="../index.html" className="flex items-center gap-3 group">
          <img
            src="../assets/logo_nobg.png"
            alt="CII MCM Trust Logo"
            className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="text-white font-extrabold text-sm md:text-base leading-tight tracking-wide">
              Mehr Chand Mahajan
            </span>
            <span className="text-amber-500 font-semibold text-[10px] md:text-xs uppercase tracking-widest">
              Trust Dharamshala
            </span>
          </div>
        </a>

        <div className="flex items-center gap-6">
          <a
            href="../index.html"
            className="flex items-center gap-1 text-slate-300 hover:text-white font-semibold text-sm transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </a>
          <a
            href="../apply.html"
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs md:text-sm uppercase tracking-wider hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-[0_4px_15px_rgba(245,158,11,0.25)]"
          >
            Apply Now
          </a>
        </div>
      </header>

      {/* Main Flow */}
      <main className="pt-20">
        
        {/* A. Editorial Hero Splash */}
        <section className="min-h-[85vh] flex flex-col justify-center items-center text-center px-6 relative overflow-hidden bg-gradient-to-b from-[#090d16] to-[#070a13] border-b border-white/5 z-20">
          <div className="max-w-4xl flex flex-col gap-6 items-center">
            <span className="text-amber-500 font-extrabold uppercase tracking-widest text-xs md:text-sm bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
              Our Journey
            </span>
            <h1 className="text-white text-5xl md:text-8xl font-black tracking-tight leading-none">
              A Legacy of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Empowerment</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-lg font-light leading-relaxed max-w-xl mx-auto">
              Scroll along the central Journey Ribbon from 1972 to present day to explore our historical milestones.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <button
                onClick={() => scrollToSection(0)}
                className="animate-bounce p-3 rounded-full border border-slate-800 bg-slate-950 text-amber-500 cursor-pointer hover:border-amber-500/40 hover:bg-slate-900 transition-colors"
                aria-label="Scroll Down"
              >
                <MousePointer className="w-5 h-5 rotate-180" />
              </button>
              <span className="text-[10px] text-slate-500 tracking-widest uppercase font-semibold">
                Scroll to Begin
              </span>
            </div>
          </div>
        </section>

        {/* B. Centered snaking SVG ribbon timeline */}
        <div className="journey-ribbon-container">
          
          {/* Background SVG Ribbon centerpiece */}
          <div className="ribbon-svg-backdrop">
            <svg
              className="w-full h-full overflow-visible"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Glowing Ribbon Gradients - Adapted to Blueish/Royal Theme */}
                <linearGradient id="ribbon-glow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#1e3a8a" />
                </linearGradient>

                <linearGradient id="ribbon-track" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1e293b" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#334155" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#1e293b" stopOpacity="0.2" />
                </linearGradient>

                {/* Glow filter */}
                <filter id="ribbon-blur" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Base background ribbon track */}
              <path
                d={pathD}
                stroke="url(#ribbon-track)"
                strokeWidth={isMobile ? 10 : 20}
                strokeLinecap="round"
              />

              {/* Active glowing progressive ribbon overlay path */}
              <path
                ref={pathRef}
                className="ribbon-progress-path"
                d={pathD}
                stroke="url(#ribbon-glow)"
                strokeWidth={isMobile ? 12 : 24}
                strokeLinecap="round"
                filter="url(#ribbon-blur)"
              />
            </svg>
          </div>

          {/* Milestone rows with year capsules and story cards */}
          <div className="relative z-20 w-full">
            {journeyData.map((milestone, idx) => {
              const isActive = activeIndex === idx;
              const isPast = idx < activeIndex;
              const isEven = idx % 2 === 0;
              const alignmentClass = isEven ? 'even' : 'odd';
              
              // Capsule visual states
              const capsuleStateClass = isActive ? 'active' : isPast ? 'past' : '';

              return (
                <div
                  key={milestone.year}
                  id={`milestone-row-${idx}`}
                  className={`milestone-row ${alignmentClass}`}
                >
                  {/* HTML Year Capsule Node integrated directly on the ribbon curve */}
                  <div
                    className={`milestone-year-capsule ${capsuleStateClass}`}
                    onClick={() => scrollToSection(idx)}
                  >
                    {milestone.year}
                  </div>

                  {/* Content Card adjacent to the ribbon curve */}
                  <div className="milestone-card-wrapper">
                    <MilestoneCard
                      milestone={milestone}
                      index={idx}
                      isActive={isActive}
                    />
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* C. Exhibition Concluding Stats Screen */}
        <ImpactStats />

      </main>

      {/* Floating Mobile Top Progress Indicator */}
      <ProgressIndicator
        milestones={journeyData}
        activeIndex={activeIndex}
      />

      {/* Back to top button */}
      {activeIndex >= 3 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-amber-500 text-slate-950 shadow-[0_4px_15px_rgba(245,158,11,0.4)] hover:bg-amber-600 transition-all duration-300 z-50 hover:scale-110"
          aria-label="Back to Top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default App;
