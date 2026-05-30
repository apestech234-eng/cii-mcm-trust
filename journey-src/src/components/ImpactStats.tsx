import React, { useEffect, useRef, useState } from 'react';
import { Award, GraduationCap, Users, Heart, ArrowRight, Home } from 'lucide-react';

interface StatItem {
  id: string;
  target: number;
  label: string;
  prefix?: string;
  suffix: string;
  icon: React.ReactNode;
}

export const ImpactStats: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [counts, setCounts] = useState<{ [key: string]: number }>({
    years: 0,
    students: 0,
    employed: 0,
    cows: 0,
  });

  const stats: StatItem[] = [
    {
      id: 'years',
      target: 35,
      label: 'Years of Devoted Service',
      suffix: '+',
      icon: <Award className="w-8 h-8 text-amber-500" />,
    },
    {
      id: 'students',
      target: 3514,
      label: 'Students Graduated',
      suffix: '+',
      icon: <GraduationCap className="w-8 h-8 text-amber-500" />,
    },
    {
      id: 'employed',
      target: 210,
      label: 'Women Employed & Supported',
      suffix: '+',
      icon: <Users className="w-8 h-8 text-amber-500" />,
    },
    {
      id: 'cows',
      target: 98,
      label: 'Cows Donated to Impoverished Families',
      suffix: '+',
      icon: <Heart className="w-8 h-8 text-amber-500" />,
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!visible) return;

    const duration = 2000; // ms
    const frameRate = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // Ease-out quad formula
      const easeProgress = progress * (2 - progress);

      setCounts({
        years: Math.round(easeProgress * 35),
        students: Math.round(easeProgress * 3514),
        employed: Math.round(easeProgress * 210),
        cows: Math.round(easeProgress * 98),
      });

      if (frame >= totalFrames) {
        clearInterval(timer);
        // Ensure exact final numbers
        setCounts({
          years: 35,
          students: 3514,
          employed: 210,
          cows: 98,
        });
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [visible]);

  return (
    <section
      id="impact-stats"
      ref={containerRef}
      className="min-h-screen bg-gradient-to-b from-[#0b0f19] to-[#08060d] py-24 px-6 md:px-12 flex flex-col justify-center items-center relative overflow-hidden"
    >
      {/* Background Ambience Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl w-full flex flex-col gap-12 relative z-10 items-center">
        <div className="text-center flex flex-col gap-4">
          <span className="text-amber-500 font-extrabold uppercase tracking-widest text-sm bg-amber-500/10 px-4 py-1.5 rounded-full inline-block mx-auto border border-amber-500/20">
            Our Total Impact
          </span>
          <h2 className="text-white text-4xl md:text-6xl font-black tracking-tight">
            Empowering Rural Communities
          </h2>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light">
            Through vocation and welfare, Mehr Chand Mahajan Trust continues to transform lives in Dharamshala and surrounding regions.
          </p>
        </div>



        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center gap-4 hover:border-amber-500/40 transition-all duration-300 relative group"
            >
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-white text-4xl md:text-5xl font-black tracking-tight">
                  {counts[stat.id].toLocaleString()}{stat.suffix}
                </span>
                <span className="text-slate-400 text-sm font-medium leading-relaxed max-w-[200px]">
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-8">
          <a
            href="../index.html"
            className="flex items-center gap-2 px-8 py-4 rounded-full bg-slate-900 border border-slate-700 text-white font-semibold text-lg hover:bg-slate-800 hover:border-slate-600 transition-all duration-300 shadow-lg"
          >
            <Home className="w-5 h-5 text-slate-400" />
            Back to Home
          </a>
          <a
            href="../apply.html"
            className="flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-[0_4px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.5)] group"
          >
            Apply for Admissions
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
};
