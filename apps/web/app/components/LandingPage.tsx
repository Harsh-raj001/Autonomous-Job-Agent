'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, cubicBezier } from 'framer-motion';
import { Sparkles, BrainCircuit, Activity, Briefcase, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Custom spring for ultra-smooth buttery parallax
const springConfig = { stiffness: 100, damping: 30, mass: 1 };

function ParallaxText({ children, offset }: { children: React.ReactNode, offset: number }) {
  const { scrollYProgress } = useScroll();
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [0, offset]), springConfig);
  return <motion.div style={{ y }}>{children}</motion.div>;
}

export default function LandingPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  // Hero Paralax
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 100]);

  // Workflow SVG Line drawing
  const pathLength = useSpring(useTransform(scrollYProgress, [0.1, 0.8], [0, 1]), springConfig);

  return (
    <div ref={containerRef} className="relative min-h-[300vh] overflow-hidden">
      
      {/* ── Layer 1: Ambient Background (handled by layout) ── */}

      {/* ── Hero: Mission Control ── */}
      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="min-h-[85vh] flex flex-col items-center justify-center text-center px-4 relative z-10 pt-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: cubicBezier(0.16, 1, 0.3, 1) }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="glass-panel px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase text-glass-olive flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-glass-olive animate-pulse" />
              Elevate Engine Active
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-medium tracking-tight text-foreground mb-6" style={{ fontFamily: 'var(--font-lora)' }}>
            Your career, <br />
            <span className="italic text-glass-olive relative inline-block">
              elevated.
              <motion.span 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                className="absolute -bottom-2 left-0 w-full h-[3px] bg-glass-gold/40 rounded-full origin-left"
              />
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed mb-12">
            The intelligent agent that discovers, analyzes, and applies to jobs autonomously.
          </p>

          <Link href="/auth/signup">
            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="glass-floating px-8 py-4 rounded-full text-glass-charcoal font-semibold text-lg flex items-center gap-3 mx-auto group"
            >
              Start Autonomous Application
              <ArrowRight className="w-5 h-5 text-glass-olive group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Live Visualization Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1, ease: cubicBezier(0.16, 1, 0.3, 1) }}
          className="mt-20 w-full max-w-5xl glass-panel rounded-3xl p-6 md:p-10 border border-white/40 grid grid-cols-1 md:grid-cols-3 gap-6 relative"
        >
          {/* Card 1 */}
          <div className="bg-white/40 rounded-2xl p-6 border border-white/30 backdrop-blur-md">
            <Activity className="w-6 h-6 text-glass-olive mb-4" />
            <h3 className="font-bold text-foreground mb-1">Scanning Opportunities</h3>
            <p className="text-sm text-muted-foreground font-medium">Analyzing 245 open roles across 12 platforms.</p>
            <div className="mt-4 h-1.5 w-full bg-white/50 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-glass-olive rounded-full"
                animate={{ width: ["0%", "100%", "0%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
          
          {/* Card 2 */}
          <div className="bg-white/40 rounded-2xl p-6 border border-white/30 backdrop-blur-md">
            <BrainCircuit className="w-6 h-6 text-glass-gold mb-4" />
            <h3 className="font-bold text-foreground mb-1">Resume Optimization</h3>
            <p className="text-sm text-muted-foreground font-medium">Tailoring profile for Frontend Engineer at Vercel.</p>
            <div className="mt-4 flex gap-1">
              {[1, 2, 3].map(i => (
                <motion.div 
                  key={i}
                  className="h-1.5 flex-1 bg-glass-gold rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white/40 rounded-2xl p-6 border border-white/30 backdrop-blur-md">
            <Briefcase className="w-6 h-6 text-glass-bronze mb-4" />
            <h3 className="font-bold text-foreground mb-1">Applications Sent</h3>
            <p className="text-sm text-muted-foreground font-medium">14 high-match applications submitted today.</p>
            <div className="mt-4 flex items-center justify-between text-xs font-bold text-glass-bronze">
              <span>Success Rate</span>
              <span>92%</span>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* ── Workflow Storytelling ── */}
      <section className="relative z-10 max-w-4xl mx-auto py-32 px-4">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground" style={{ fontFamily: 'var(--font-lora)' }}>
            The Autonomous Workflow
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">Watch your career move forward.</p>
        </div>

        <div className="relative">
          {/* SVG Scroll Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-glass-olive/10 -translate-x-1/2" />
          <motion.div 
            className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-glass-olive origin-top -translate-x-1/2"
            style={{ scaleY: pathLength }}
          />

          {/* Workflow Steps */}
          {[
            { title: "Discovery", desc: "AI scans the internet for roles matching your exact criteria.", icon: Sparkles },
            { title: "Analysis", desc: "Every job description is broken down to identify key requirements.", icon: Activity },
            { title: "Tailoring", desc: "Your resume is dynamically rewritten to highlight relevant experience.", icon: FileText },
            { title: "Application", desc: "Forms are filled, cover letters generated, and applications submitted.", icon: ArrowRight },
            { title: "Interview", desc: "You receive the interview invites. You take it from here.", icon: Briefcase },
          ].map((step, i) => (
            <div key={i} className={`relative flex items-center mb-32 last:mb-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
              
              {/* Center Node */}
              <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full bg-glass-cream border-2 border-glass-olive -translate-x-1/2 z-10 shadow-[0_0_15px_rgba(85,107,47,0.4)]" />

              {/* Content Card */}
              <div className={`ml-20 md:ml-0 w-full md:w-1/2 ${i % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}>
                <ParallaxText offset={-30 * (i % 2 === 0 ? 1 : -1)}>
                  <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                    className="glass-panel p-8 rounded-3xl group hover:shadow-xl hover:-translate-y-2 transition-all duration-500"
                  >
                    <step.icon className={`w-8 h-8 text-glass-olive mb-4 ${i % 2 === 0 ? 'md:ml-auto' : ''}`} />
                    <h3 className="text-2xl font-bold text-foreground mb-3" style={{ fontFamily: 'var(--font-lora)' }}>{step.title}</h3>
                    <p className="text-muted-foreground font-medium leading-relaxed">{step.desc}</p>
                  </motion.div>
                </ParallaxText>
              </div>

            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
