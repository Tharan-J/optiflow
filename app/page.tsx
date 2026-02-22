'use client';

import Link from 'next/link';
import {
  ArrowRight, Activity, Zap, Play, XCircle, Brain, ShieldAlert, Timer, Stethoscope,
  ArrowRightLeft, FlaskConical, ScanLine, Linkedin, Twitter, Mail, ChevronRight,
  Waves, BarChart3, CircleCheck, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, useInView } from 'framer-motion';
import { useRef, ReactNode } from 'react';

// ─── Animation Wrapper ─────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = '', eager = false }: { children: ReactNode; delay?: number; className?: string; eager?: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: eager ? 0 : 0.05 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FadeIn({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Nav ───────────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <header className="px-6 py-3.5 md:px-12 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-teal-900 tracking-tight">OptiFlow</span>
      </Link>

      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
        <Link href="#comparison" className="hover:text-teal-900 transition-colors">Why OptiFlow</Link>
        <Link href="#workflow" className="hover:text-teal-900 transition-colors">How It Works</Link>
        <Link href="#features" className="hover:text-teal-900 transition-colors">Features</Link>
      </nav>

      <div className="flex items-center gap-2.5">
        <Link href="/patient" className="hidden md:block">
          <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-white rounded-xl text-sm font-medium">
            Patient Tracker
          </Button>
        </Link>
        <Link href="/auth/login">
          <Button variant="outline" size="sm" className="border-teal-200 text-teal-700 hover:bg-teal-50 bg-white rounded-xl text-sm font-semibold hidden sm:flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Staff Portal
          </Button>
        </Link>
        <Link href="/dashboard/manager">
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20 rounded-xl text-sm font-semibold">
            Control Tower <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </header>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative bg-white overflow-hidden py-20 md:py-28 px-6">
      {/* Subtle radial BG */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-radial from-emerald-50 via-slate-50 to-transparent opacity-80 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto text-center space-y-8">
        {/* Tag */}
        <FadeUp eager>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Hospital Logic Engine v3.0 — Live
          </div>
        </FadeUp>

        {/* Headline */}
        <FadeUp delay={0.08} eager>
          <h1 className="text-5xl md:text-6xl lg:text-[72px] font-extrabold tracking-tight text-teal-900 leading-[1.08] mx-auto max-w-5xl">
            Precision in Every Pulse,{' '}
            <span className="text-emerald-600">Intelligence</span>{' '}
            in Every Path.
          </h1>
        </FadeUp>

        {/* Sub */}
        <FadeUp delay={0.15} eager>
          <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-medium">
            The world's first AI-driven middleware that transforms your static EHR data into a
            real-time hospital control tower. Predict bottlenecks, automate routing, and reclaim{' '}
            <strong className="text-teal-800 font-semibold">30% of your clinical day.</strong>
          </p>
        </FadeUp>

        {/* CTAs */}
        <FadeUp delay={0.22} eager>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard/manager">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 rounded-2xl text-base font-semibold px-8 h-12 min-w-[200px]">
                Request Live Demo
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/dashboard/intelligence">
              <Button size="lg" variant="outline" className="rounded-2xl text-base font-semibold px-8 h-12 border-slate-300 text-teal-900 hover:bg-slate-50 min-w-[200px]">
                <Play className="mr-2 w-4 h-4 text-emerald-600 fill-emerald-600" />
                Watch Flow Simulation
              </Button>
            </Link>
          </div>
        </FadeUp>

        {/* Floating UI Mockup */}
        <FadeUp delay={0.3} eager>
          <div className="relative mx-auto max-w-5xl mt-12">
            {/* Glow */}
            <div className="absolute -inset-4 bg-gradient-to-b from-emerald-100/60 via-transparent to-transparent rounded-3xl blur-2xl pointer-events-none" />

            <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200 overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-100 bg-slate-50">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="flex-1 mx-3 text-xs text-center text-slate-400 font-mono">optiflow.health/dashboard/intelligence</span>
              </div>

              {/* Mock Dashboard Content */}
              <div className="grid md:grid-cols-2 gap-0 divide-x divide-slate-100">
                {/* Flow Intelligence Heatmap */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Flow Intelligence</p>
                      <h3 className="text-sm font-bold text-teal-900 mt-0.5">Delta-T Gap Monitor</h3>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full border border-emerald-200">LIVE</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Registration → Refraction', pct: 82, color: 'bg-emerald-500' },
                      { label: 'Refraction → Dilation', pct: 94, color: 'bg-amber-400' },
                      { label: 'Dilation → Consultation', pct: 53, color: 'bg-red-400' },
                      { label: 'Consultation → Tests', pct: 71, color: 'bg-emerald-400' },
                    ].map((row) => (
                      <div key={row.label}>
                        <div className="flex justify-between text-[10px] font-medium text-slate-500 mb-1">
                          <span>{row.label}</span>
                          <span>{row.pct}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${row.color} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${row.pct}%` }}
                            transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                    <p className="text-[10px] font-bold text-amber-800">⚠ Bottleneck Alert — Dilation area predicted to exceed capacity in 28 min.</p>
                  </div>
                </div>

                {/* Patient Pizza Tracker */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Patient Journey</p>
                      <h3 className="text-sm font-bold text-teal-900 mt-0.5">Pizza Tracker — Token A042</h3>
                    </div>
                    <span className="text-[10px] font-bold bg-sky-100 text-sky-700 px-2 py-1 rounded-full border border-sky-200">IN DILATION</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    {['Reg', 'Refraction', 'Dilation', 'Consult', 'Tests'].map((step, i) => (
                      <div key={step} className="flex items-center">
                        <div className={`flex flex-col items-center gap-1`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold border-2 ${i < 2 ? 'bg-emerald-500 border-emerald-500 text-white' : i === 2 ? 'bg-sky-500 border-sky-500 text-white animate-pulse' : 'bg-white border-slate-200 text-slate-300'}`}>
                            {i < 2 ? '✓' : i + 1}
                          </div>
                          <span className="text-[8px] text-slate-400 font-medium">{step}</span>
                        </div>
                        {i < 4 && <div className={`w-4 h-0.5 mb-3 ${i < 2 ? 'bg-emerald-300' : 'bg-slate-200'}`} />}
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl text-center">
                    <p className="text-[10px] font-medium text-sky-600">Dilation countdown</p>
                    <p className="text-xl font-extrabold text-sky-800 font-mono tracking-wider">18:42</p>
                    <p className="text-[9px] text-sky-500 mt-0.5">Est. ready for consultation at 16:05</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeUp>

        {/* Trust bar */}
        <FadeIn delay={0.5}>
          <div className="flex flex-wrap gap-6 justify-center items-center pt-4">
            {['50+ Vision Centers', '2.4M+ Patients Tracked', '99.9% Uptime SLA', 'HIPAA Compliant'].map(stat => (
              <div key={stat} className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <CircleCheck className="w-4 h-4 text-emerald-500" />
                {stat}
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Comparison Section ────────────────────────────────────────────────────────
function ComparisonSection() {
  const legacyCons = [
    'Records what happened (Post-facto)',
    'Manual queue management by staff',
    'Staff blind to upcoming patient surges',
    'Unmanaged hallway congestion',
    'Zero real-time routing intelligence',
  ];
  const optiflowPros = [
    'Predicts what\'s next (Proactive AI)',
    'Dynamic AI-driven patient re-routing',
    'Digital Twin staffing simulations',
    'Zero-friction EHR integration',
    'Delta-T bottleneck detection engine',
  ];

  return (
    <section id="comparison" className="py-20 md:py-28 bg-slate-50 px-6">
      <div className="max-w-6xl mx-auto">
        <FadeUp>
          <div className="text-center mb-14 space-y-3">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">The Intelligence Gap</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-teal-900 tracking-tight">From Passive Record to<br />Active Orchestrator</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">Traditional EHR systems capture events. OptiFlow acts on them.</p>
          </div>
        </FadeUp>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Card A – Legacy */}
          <FadeUp delay={0.1}>
            <div className="relative bg-white border border-red-100 rounded-2xl p-8 shadow-sm overflow-hidden h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-300 to-red-200" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Benchmark</p>
                  <h3 className="font-bold text-slate-800 text-base">Traditional EHR / Open Source</h3>
                </div>
                <span className="ml-auto text-xs font-semibold text-red-500 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">Passive Record</span>
              </div>
              <ul className="space-y-3.5">
                {legacyCons.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm text-slate-500 font-medium">
                    <span className="w-4 h-4 rounded-full bg-red-100 mt-0.5 flex-shrink-0 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
              <div className="mt-8 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <p className="text-xs font-semibold text-slate-400 mb-1">Typical outcome</p>
                <p className="text-sm font-bold text-slate-700">23% of patient time spent waiting in unmanaged queues.</p>
              </div>
            </div>
          </FadeUp>

          {/* Card B – OptiFlow */}
          <FadeUp delay={0.2}>
            <div className="relative bg-white border border-emerald-200 rounded-2xl p-8 shadow-md shadow-emerald-500/5 overflow-hidden h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <Waves className="w-5 h-5 text-emerald-600 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Intelligence Layer</p>
                  <h3 className="font-bold text-teal-900 text-base">OptiFlow AI Middleware</h3>
                </div>
                <span className="ml-auto text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">Active Orchestrator</span>
              </div>
              <ul className="space-y-3.5">
                {optiflowPros.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm text-teal-900 font-medium">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 mt-0.5 flex-shrink-0 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
              <div className="mt-8 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <p className="text-xs font-semibold text-emerald-700 mb-1">OptiFlow outcome</p>
                <p className="text-sm font-bold text-teal-900">30% reduction in per-patient dwell time within 30 days of deployment.</p>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ─── Workflow Section ──────────────────────────────────────────────────────────
function WorkflowSection() {
  const steps = [
    {
      icon: ScanLine,
      step: '01',
      title: 'Passive Hook',
      color: 'sky',
      desc: 'OptiFlow monitors your EHR "Save" events — Refraction notes, Dilation starts, Consultation records — without changing staff workflows or requiring any data re-entry.',
    },
    {
      icon: Brain,
      step: '02',
      title: 'AI Analysis',
      color: 'violet',
      desc: 'Our engine calculates the "Delta-T" latency across every station. It compares real-time throughput against historical baselines and simulates the next 90 minutes.',
    },
    {
      icon: ArrowRightLeft,
      step: '03',
      title: 'Dynamic Routing',
      color: 'emerald',
      desc: 'Bottleneck detected at a Consultant room? OptiFlow re-orders the patient journey — sending patients to Counseling first — keeping the entire floor moving.',
    },
    {
      icon: Zap,
      step: '04',
      title: 'Transparent Journey',
      color: 'amber',
      desc: 'Patients track their own progress via a QR-linked Wait Tracker on their phone. Real-time updates reduce front-desk inquiries by up to 60%.',
    },
  ];

  const colorMap: Record<string, { bg: string; icon: string; badge: string; border: string }> = {
    sky: { bg: 'bg-sky-50', icon: 'text-sky-600', badge: 'bg-sky-100 text-sky-700 border-sky-200', border: 'border-sky-200' },
    violet: { bg: 'bg-violet-50', icon: 'text-violet-600', badge: 'bg-violet-100 text-violet-700 border-violet-200', border: 'border-violet-200' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', border: 'border-emerald-200' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', badge: 'bg-amber-100 text-amber-700 border-amber-200', border: 'border-amber-200' },
  };

  return (
    <section id="workflow" className="py-20 md:py-28 bg-white px-6">
      <div className="max-w-6xl mx-auto">
        <FadeUp>
          <div className="text-center mb-16 space-y-3">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">How OptiFlow Works</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-teal-900 tracking-tight">Four Steps to a Bottleneck-Free Floor</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">A seamless intelligence loop — no workflow disruption, no new hardware.</p>
          </div>
        </FadeUp>

        {/* Steps with connectors */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, i) => {
            const c = colorMap[step.color];
            return (
              <FadeUp key={step.step} delay={i * 0.1}>
                <div className={`relative bg-white border ${c.border} rounded-2xl p-6 shadow-sm h-full`}>
                  {/* Step number */}
                  <span className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-full border ${c.badge} mb-4`}>
                    Step {step.step}
                  </span>
                  <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center mb-4`}>
                    <step.icon className={`w-5 h-5 ${c.icon}`} />
                  </div>
                  <h3 className="font-bold text-teal-900 text-base mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{step.desc}</p>

                  {/* Connector arrow (except last) */}
                  {i < 3 && (
                    <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center bg-white rounded-full border border-slate-200 shadow-sm">
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                </div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Features Grid ─────────────────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon: ScanLine,
      title: 'Shadow Triage',
      desc: 'Auto-calculates patient complexity at registration using symptom analysis, age, and history. High-complexity cases are flagged and routed to fast-track paths before they reach the floor.',
      tag: 'AI Registration',
    },
    {
      icon: Timer,
      title: 'Dilation Countdown',
      desc: 'Real-time biological timers for every dilated patient. Nurses and doctors know precisely when each patient is pharmacologically ready — eliminating wasted chair time.',
      tag: 'Biological Intelligence',
    },
    {
      icon: Stethoscope,
      title: 'Doctor Velocity',
      desc: 'Matches patient complexity scores to individual surgeon speed profiles. Ensures lists are balanced, consult times are met, and no doctor finishes too early or too late.',
      tag: 'Scheduling AI',
    },
    {
      icon: ShieldAlert,
      title: 'Bottleneck Early Warning',
      desc: 'Floor-manager alerts dispatched 30 minutes before a predicted surge. The AI recommends specific corrective actions — not just warnings — to prevent cascades.',
      tag: 'Predictive Safety',
    },
    {
      icon: BarChart3,
      title: 'Delta-T Gap Monitor',
      desc: 'A live heatmap of process divergence across every handoff. Spots when Refraction saves are outpacing Consultation starts and triggers dynamic re-balancing.',
      tag: 'Flow Analytics',
    },
    {
      icon: FlaskConical,
      title: 'Digital Twin Simulation',
      desc: 'Run "What if" scenarios before deploying real-world routing changes. Simulate adding a Refraction room, a late doctor, or a priority case surge — all risk-free.',
      tag: 'Simulation Engine',
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 bg-slate-50 px-6">
      <div className="max-w-6xl mx-auto">
        <FadeUp>
          <div className="text-center mb-14 space-y-3">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">Platform Capabilities</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-teal-900 tracking-tight">Built for High-Volume<br />Vision Centers</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">Six precision instruments, one unified control tower.</p>
          </div>
        </FadeUp>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, i) => (
            <FadeUp key={feat.title} delay={Math.floor(i / 3) * 0.1 + (i % 3) * 0.07}>
              <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200 group h-full flex flex-col">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 transition-colors duration-200">
                    <feat.icon className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors duration-200" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {feat.tag}
                  </span>
                </div>
                <h3 className="font-bold text-teal-900 text-base mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed flex-1">{feat.desc}</p>
                <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-emerald-600 group-hover:gap-2 transition-all">
                  Learn more <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Band ──────────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="py-20 px-6 bg-teal-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-teal-700/30 rounded-full blur-3xl" />
      </div>
      <FadeUp>
        <div className="max-w-3xl mx-auto text-center space-y-6 relative">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Ready to Orchestrate?</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Your Control Tower<br />is 30 Days Away.
          </h2>
          <p className="text-teal-200 text-lg font-medium max-w-xl mx-auto">
            Plug into your existing EHR. No new hardware. No workflow changes. Just intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/dashboard/manager">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 rounded-2xl text-base font-semibold px-8 h-12">
                Request Live Demo <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/dashboard/intelligence">
              <Button size="lg" variant="outline" className="rounded-2xl text-base font-semibold px-8 h-12 border-teal-500 text-teal-100 hover:bg-teal-800 bg-transparent">
                Explore Digital Twin
              </Button>
            </Link>
          </div>
        </div>
      </FadeUp>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-teal-900">OptiFlow</span>
            </div>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              The Intelligence Layer for Modern Ophthalmology.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-sky-50 hover:text-sky-600 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h4 className="font-bold text-teal-900 text-sm">Platform</h4>
            <ul className="space-y-2.5 text-sm text-slate-500 font-medium">
              {[
                { label: 'Manager Control Tower', href: '/dashboard/manager' },
                { label: 'Doctor Queue', href: '/dashboard/doctor' },
                { label: 'Floor Manager', href: '/dashboard/floor' },
                { label: 'Patient Tracker', href: '/patient' },
                { label: 'AI Intelligence', href: '/dashboard/intelligence' },
              ].map(l => (
                <li key={l.label}><Link href={l.href} className="hover:text-emerald-600 transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-bold text-teal-900 text-sm">Resources</h4>
            <ul className="space-y-2.5 text-sm text-slate-500 font-medium">
              {['Case Studies', 'Documentation', 'API Reference', 'Changelog', 'Status'].map(l => (
                <li key={l}><a href="#" className="hover:text-emerald-600 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-bold text-teal-900 text-sm">Join the Flow</h4>
            <p className="text-sm text-slate-500 font-medium">Clinical intelligence updates. Once a month. No fluff.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="you@clinic.com"
                className="flex-1 min-w-0 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 placeholder:text-slate-400 font-medium"
              />
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shrink-0">
                <Mail className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400 font-medium">© 2024 OptiFlow Health Technologies. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-slate-400 font-medium">
            <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ComparisonSection />
        <WorkflowSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
