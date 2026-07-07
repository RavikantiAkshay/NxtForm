import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleScrollToFeatures = (e) => {
    e.preventDefault();
    document.getElementById('precision-engineering-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#0a0a0a] text-[#e5e2e1] min-h-screen selection:bg-primary selection:text-on-primary antialiased font-body-md text-body-md overflow-x-hidden">

      {/* 1. Unified Navigation Shell */}
      <TopNavbar />

      <main>
        {/* 2. Hero Section (from Sophisticated - Side-by-side layout optimized for fit) */}
        <section className="relative flex flex-col items-center justify-center pt-44 pb-28 lg:pt-48 lg:pb-32 px-margin-desktop overflow-hidden bg-background">
          {/* Abstract Geometric Background */}
          <div className="absolute inset-0 z-0">
            {/* Gradient Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#8b5cf6] rounded-full blur-[180px] opacity-[0.08]"></div>
            <div className="absolute bottom-[-30%] right-[-10%] w-[500px] h-[500px] bg-[#6d28d9] rounded-full blur-[160px] opacity-[0.06]"></div>
            <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-[#a78bfa] rounded-full blur-[120px] opacity-[0.05]"></div>
            {/* Subtle dot grid */}
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: 'radial-gradient(circle, #e5e2e1 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}></div>
            {/* Edge fade */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#131313] via-transparent to-[#131313]"></div>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full max-w-7xl mx-auto">
            {/* Left Column: Headline and Call-to-Actions */}
            <div className="col-span-12 lg:col-span-5 text-left flex flex-col justify-center">
              <div className="inline-flex self-start items-center gap-2 bg-surface-container-high/50 border border-outline-variant px-4 py-1.5 rounded-full mb-6">
                <div className="w-2 h-2 rounded-full bg-primary pulse-dot"></div>
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">Build Smarter Forms, Faster</span>
              </div>

              <h1 className="font-display-lg text-[40px] lg:text-[44px] mb-6 leading-tight text-white">
                Forms That <br /><span className="violet-gradient-text">Build Themselves.</span>
              </h1>

              <p className="font-body-lg text-[16px] text-on-surface-variant mb-8 max-w-xl">
                Tired of building every form field from scratch? NxtForm lets you pick ready-made templates like Name, Email, or Rating — drop them in, customize the question, and publish. Done.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-start gap-4">
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full sm:w-auto bg-primary text-on-primary px-8 py-3.5 rounded-xl font-label-md text-label-md font-bold text-[16px] hover:shadow-[0_0_30px_rgba(208,188,255,0.4)] transition-all"
                >
                  Start Building Free
                </button>
                <button
                  onClick={handleScrollToFeatures}
                  className="w-full sm:w-auto border border-outline text-on-surface px-8 py-3.5 rounded-xl font-label-md text-label-md text-[16px] hover:bg-white/5 transition-all"
                >
                  See Features
                </button>
              </div>
            </div>

            {/* Right Column: Mini Builder Mockup */}
            <div className="col-span-12 lg:col-span-7 w-full">
              <div className="glass-card rounded-2xl border border-outline-variant/30 shadow-2xl relative overflow-hidden group">
                {/* Window chrome */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-outline-variant bg-[#111]/60">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
                    </div>
                    <span className="text-on-surface-variant font-label-sm">NxtForm Builder</span>
                  </div>
                  <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">
                    <span className="material-symbols-outlined text-primary text-[14px]">send</span>
                    <span className="text-primary font-label-sm text-[11px]">Publish</span>
                  </div>
                </div>

                {/* Builder body: sidebar + canvas */}
                <div className="flex" style={{ minHeight: '220px' }}>
                  {/* Mini sidebar */}
                  <div className="w-[140px] border-r border-outline-variant bg-[#0d0d0d] p-3 flex flex-col gap-1 text-left shrink-0">
                    <div className="text-[9px] uppercase tracking-widest text-on-surface-variant mb-2 font-bold">Fields</div>
                    {[
                      { icon: 'short_text', label: 'Short Text' },
                      { icon: 'person', label: 'Full Name' },
                      { icon: 'mail', label: 'Email' },
                      { icon: 'star', label: 'Rating' },
                      { icon: 'toggle_on', label: 'Yes / No' },
                      { icon: 'draw', label: 'Signature' },
                    ].map((f, i) => (
                      <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded text-[11px] transition-colors ${
                        i === 2 ? 'bg-primary/15 text-primary border border-primary/30' : 'text-on-surface-variant hover:bg-[#1a1a1a]'
                      }`}>
                        <span className="material-symbols-outlined text-[14px]">{f.icon}</span>
                        {f.label}
                      </div>
                    ))}
                  </div>

                  {/* Canvas area */}
                  <div className="flex-1 p-5 space-y-3 text-left bg-[#0a0a0a]">
                    <div className="p-3 bg-surface-container-high border border-outline-variant rounded-lg">
                      <div className="text-[10px] uppercase text-on-surface-variant mb-1 font-bold tracking-wider">Full Name</div>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-surface-container-lowest border border-outline-variant rounded px-2 py-1.5 text-[12px] text-on-surface-variant">First Name</div>
                        <div className="flex-1 bg-surface-container-lowest border border-outline-variant rounded px-2 py-1.5 text-[12px] text-on-surface-variant">Last Name</div>
                      </div>
                    </div>
                    <div className="p-3 bg-primary/5 border-2 border-primary/40 rounded-lg ring-2 ring-primary/20">
                      <div className="text-[10px] uppercase text-primary mb-1 font-bold tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">mail</span> Email Address
                      </div>
                      <div className="bg-surface-container-lowest border border-outline-variant rounded px-2 py-1.5 text-[12px] text-on-surface-variant">you@company.com</div>
                    </div>
                    <div className="p-3 bg-surface-container-high border border-outline-variant rounded-lg">
                      <div className="text-[10px] uppercase text-on-surface-variant mb-1.5 font-bold tracking-wider">Rate your experience</div>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className={`material-symbols-outlined text-[18px] ${s <= 4 ? 'text-primary' : 'text-on-surface-variant/30'}`} style={s <= 4 ? { fontVariationSettings: "'FILL' 1" } : {}}>star</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Autonomous Onboarding (from Command Center - exactly as it is) */}
        <section id="how-it-works" className="px-margin-desktop py-24 border-t border-[#1a1a1a]/60 bg-[#0a0a0a]">
          <div className="grid grid-cols-12 gap-gutter max-w-7xl mx-auto">
            <div className="col-span-12 md:col-span-4 flex flex-col justify-center text-left">
              <h2 className="font-mono text-headline-lg uppercase mb-6 tracking-tighter text-white">How It <br />Works</h2>
              <p className="text-on-surface-variant font-mono text-body-md mb-8">
                Three steps. No learning curve. Pick what you need, see it live, and start collecting responses.
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="self-start bg-[#8b5cf6] text-[#0a0a0a] px-6 py-2.5 font-mono text-label-md font-bold uppercase tracking-widest active:scale-95 transition-transform rounded-none hover:bg-[#a78bfa]"
              >
                Try It Now
              </button>
            </div>

            <div className="col-span-12 md:col-span-8">
              <div className="glass-module p-6 lg:p-10 relative overflow-hidden bg-[#0a0a0a] border-2 border-outline-variant rounded-2xl text-left shadow-2xl">
                <div className="absolute top-0 left-0 p-3 border-r-2 border-b-2 border-outline-variant rounded-tl-2xl rounded-br-lg font-mono text-label-sm uppercase text-on-surface-variant/70">
                  Workflow
                </div>
                <div className="space-y-0 mt-8">
                  {/* Step 1 */}
                  <div className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-[#8b5cf6] flex items-center justify-center text-[#0a0a0a] font-bold text-sm shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.3)]">01</div>
                      <div className="w-px flex-1 border-l-2 border-dashed border-[#8b5cf6]/30 my-2"></div>
                    </div>
                    <div className="pb-8">
                      <h3 className="font-headline-sm text-on-surface font-semibold mb-2">Choose Your Fields</h3>
                      <p className="text-on-surface-variant font-body-md text-[15px] mb-4">Browse the sidebar and click any template to add it. Full Name, Email, Rating, NPS, Signature — each one drops in with a ready-to-go question.</p>
                      <div className="flex gap-2">
                        <span className="border border-[#8b5cf6] bg-[#8b5cf6]/10 px-3 py-1.5 text-sm flex items-center justify-center text-[#8b5cf6] rounded-full material-symbols-outlined">person</span>
                        <span className="border border-[#8b5cf6] bg-[#8b5cf6]/10 px-3 py-1.5 text-sm flex items-center justify-center text-[#8b5cf6] rounded-full material-symbols-outlined">mail</span>
                        <span className="border border-[#8b5cf6] bg-[#8b5cf6]/10 px-3 py-1.5 text-sm flex items-center justify-center text-[#8b5cf6] rounded-full material-symbols-outlined">star</span>
                        <span className="border border-outline-variant px-3 py-1.5 text-sm font-medium text-on-surface-variant rounded-full">+27 more</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-[#8b5cf6] flex items-center justify-center text-[#0a0a0a] font-bold text-sm shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.3)]">02</div>
                      <div className="w-px flex-1 border-l-2 border-dashed border-[#8b5cf6]/30 my-2"></div>
                    </div>
                    <div className="pb-8">
                      <h3 className="font-headline-sm text-on-surface font-semibold mb-2">Preview on Device</h3>
                      <p className="text-on-surface-variant font-body-md text-[15px] mb-4">A phone mockup updates in real time as you build. What you see is exactly what respondents get — no surprises after publishing.</p>
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-24 border border-outline-variant rounded-xl flex items-center justify-center bg-[#0d0d0d] shadow-inner relative overflow-hidden">
                          <div className="absolute top-1 w-4 h-1 bg-outline-variant rounded-full"></div>
                          <span className="material-symbols-outlined text-[#8b5cf6] text-[20px]">smartphone</span>
                        </div>
                        <span className="material-symbols-outlined text-[#8b5cf6]/50 text-[16px]">sync</span>
                        <span className="font-label-md text-on-surface-variant font-medium">Live Sync</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-[#8b5cf6] flex items-center justify-center text-[#0a0a0a] font-bold text-sm shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.3)]">03</div>
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-on-surface font-semibold mb-2">Publish & Collect</h3>
                      <p className="text-on-surface-variant font-body-md text-[15px] mb-4">Hit publish, share the link, and watch responses flow into your dashboard. Filter, review, and export — all from one screen.</p>
                      <div className="flex items-center gap-3">
                        <div className="bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 px-4 py-2 font-label-md font-medium text-[#8b5cf6] rounded-full flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px]">check_circle</span> Published
                        </div>
                        <span className="material-symbols-outlined text-outline-variant text-[18px]">arrow_forward</span>
                        <div className="border border-outline-variant px-4 py-2 font-label-md font-medium text-on-surface-variant rounded-full flex items-center gap-2 bg-[#0d0d0d]">
                          <span className="material-symbols-outlined text-[16px]">inbox</span> 24 Responses
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                  <div className="w-full h-20 bg-[#8b5cf6] blur-[100px] absolute -top-20 animate-[scan_8s_linear_infinite]"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Precision Engineering Bento Grid (from Sophisticated - exactly as it is) */}
        <section id="precision-engineering-section" className="py-24 px-margin-desktop max-w-container-max mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-headline-lg text-headline-lg mb-4 text-white">Everything You Need to Collect Data</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto">A visual builder, a live device preview, and a response inbox — all in one place.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-stack-lg h-auto md:h-[450px]">
            {/* Bento Item 1 */}
            <div className="md:col-span-7 glass-card rounded-2xl p-6 lg:p-8 border border-outline-variant flex flex-col justify-between hover:bg-surface-container-high/80 transition-all duration-500 group text-left">
              <div className="max-w-md">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>neurology</span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-2.5 text-white">Visual Form Builder</h3>
                <p className="text-on-surface-variant text-body-md">A clean sidebar lists every field type by category. Click one and it drops into your form canvas. Edit the question text inline, toggle required, reorder — no code, no confusion.</p>
              </div>
              <div className="mt-6 flex gap-4">
                <div className="bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 text-primary text-label-sm">Inline Editing</div>
                <div className="bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 text-primary text-label-sm">Categorized Library</div>
              </div>
            </div>

            {/* Bento Item 2 */}
            <div className="md:col-span-5 bg-surface-container-high rounded-2xl p-6 lg:p-8 border border-outline-variant flex flex-col justify-center relative overflow-hidden group text-left">
              <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                <span className="material-symbols-outlined text-[100px] text-primary">security</span>
              </div>
              <div className="relative z-10">
                <h3 className="font-headline-md text-headline-md mb-2.5 text-white">Real-Time Device Preview</h3>
                <p className="text-on-surface-variant text-body-md">As you add fields, a phone mockup on the right updates instantly — showing exactly what your respondents will see.</p>
                <a className="inline-flex items-center gap-2 mt-4 text-primary font-label-md hover:gap-3 transition-all" href="#">
                  Try It Now <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </a>
              </div>
            </div>

            {/* Bento Item 3 */}
            <div className="md:col-span-4 glass-card rounded-2xl p-6 border border-outline-variant flex flex-col items-center text-center justify-center hover:shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-4 border border-outline-variant">
                <span className="material-symbols-outlined text-on-surface text-[24px]">speed</span>
              </div>
              <h3 className="font-label-md text-label-md font-bold uppercase tracking-widest mb-2 text-white">Instant Setup</h3>
              <p className="text-on-surface-variant text-label-md">Click a template, tweak the question, publish. That's it.</p>
            </div>

            {/* Bento Item 4 */}
            <div className="md:col-span-8 bg-surface-container-lowest rounded-2xl p-6 lg:p-8 border border-outline-variant flex flex-col md:flex-row items-center gap-6 hover:border-primary/40 transition-colors text-left">
              <div className="flex-1">
                <h3 className="font-headline-md text-headline-md mb-2.5 text-white">Response Dashboard</h3>
                <p className="text-on-surface-variant text-body-md">Every response lands in a clean, organized dashboard. Filter, search, and review submissions without spreadsheets or external tools.</p>
              </div>
              <div className="flex-shrink-0 grid grid-cols-2 gap-4">
                <div className="w-20 h-20 rounded-2xl bg-surface-container border border-outline-variant flex items-center justify-center">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-primary text-[24px]">table_chart</span>
                    <div className="text-[10px] text-on-surface-variant uppercase">Table</div>
                  </div>
                </div>
                <div className="w-20 h-20 rounded-2xl bg-surface-container border border-outline-variant flex items-center justify-center">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-primary text-[24px]">filter_alt</span>
                    <div className="text-[10px] text-on-surface-variant uppercase">Filter</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Engineered for the Modern Web Bento Grid (from Premium - exactly as it is) */}
        <section className="w-full px-margin-desktop py-24 border-t border-[#1a1a1a]/60 bg-[#0a0a0a]">
          <div className="max-w-6xl mx-auto w-full">
            <div className="mb-20 text-center">
              <h2 className="font-headline-lg text-headline-lg font-semibold text-on-surface mb-4 text-white">How It All Comes Together</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">Three core pieces that make form building effortless — from first click to final submission.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {/* Feature 1 */}
              <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-8 flex flex-col h-full glow-hover hover:shadow-[0_0_20px_rgba(208,188,255,0.15)] hover:border-[#494454] transition-all duration-300 text-left">
                <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center mb-6 border border-outline-variant/30">
                  <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-3 text-white">Pick Your Fields</h3>
                <p className="font-body-md text-body-md text-on-surface-variant flex-grow">Browse categories like Templates, Ratings, Interactive, and Layout. Each field comes with a pre-written question so you can add it and move on.</p>
                <div className="mt-6 pt-6 border-t border-[#1e1e1e]">
                  <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider flex items-center gap-1 cursor-pointer">Open Builder <span className="material-symbols-outlined text-[14px]">chevron_right</span></span>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-8 flex flex-col h-full glow-hover hover:shadow-[0_0_20px_rgba(208,188,255,0.15)] hover:border-[#494454] transition-all duration-300 relative overflow-hidden text-left">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center mb-6 border border-outline-variant/30 relative z-10">
                  <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>schema</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-3 relative z-10 text-white">Customize Everything</h3>
                <p className="font-body-md text-body-md text-on-surface-variant flex-grow relative z-10">Change the question text, mark fields as required, reorder blocks. The preview updates as you type so you always know what you're publishing.</p>
                <div className="mt-6 p-3 bg-[#0a0a0a] border border-[#1e1e1e] rounded font-mono text-[12px] text-on-surface-variant relative z-10 overflow-hidden">
                  <code className="!bg-transparent !p-0 !text-[12px] !text-on-surface-variant !inline-block whitespace-nowrap">{`title → required → reorder → publish`}</code>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-8 flex flex-col h-full glow-hover hover:shadow-[0_0_20px_rgba(208,188,255,0.15)] hover:border-[#494454] transition-all duration-300 text-left">
                <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center mb-6 border border-outline-variant/30">
                  <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-3 text-white">Collect & Review</h3>
                <p className="font-body-md text-body-md text-on-surface-variant flex-grow">Once published, every submission goes straight to your Response Dashboard. Filter by date, search by content, and export when you need to.</p>
                <div className="mt-6 pt-6 border-t border-[#1e1e1e] flex gap-2">
                  <div className="h-1 flex-grow bg-[#1e1e1e] rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[75%] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Dynamic Visual Section (from Sophisticated - exactly as it is) */}
        <section className="py-24 bg-[#0a0a0a] border-t border-[#1a1a1a]/60 relative overflow-hidden">
          <div className="max-w-container-max mx-auto px-margin-desktop grid grid-cols-1 lg:grid-cols-2 items-center gap-20">
            <div className="text-left">
              <h2 className="font-display-lg text-[40px] mb-stack-lg leading-tight text-white">Not Just Text Boxes <br/>and <span className="text-primary">Dropdowns.</span></h2>
              <p className="text-body-lg text-on-surface-variant mb-stack-lg">
                Most form builders stop at basic inputs. NxtForm goes further with specialized fields that would take hours to code by hand — available in a single click.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                  <div>
                    <h4 className="font-label-md text-label-md font-bold text-on-surface">Survey-Ready Components</h4>
                    <p className="text-label-md text-on-surface-variant">NPS (0-10), Star Rating, Emoji Rating, Matrix Grid, and Linear Scale — designed for collecting nuanced feedback.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                  <div>
                    <h4 className="font-label-md text-label-md font-bold text-on-surface">Advanced Input Types</h4>
                    <p className="text-label-md text-on-surface-variant">Signature Pad, OTP verification, Color Picker, Credit Card, Slider, Counter, and Tags — each with a polished preview.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="relative flex justify-center">
              {/* Field Type Showcase */}
              <div className="w-full max-w-lg glass-card rounded-[2rem] p-6 border border-primary/20 relative group overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 blur-[80px] rounded-full"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/10 blur-[80px] rounded-full"></div>
                <div className="relative z-10 grid grid-cols-3 gap-3">
                  {[
                    { icon: 'star', label: 'Star Rating', active: false },
                    { icon: 'speed', label: 'NPS (0-10)', active: true },
                    { icon: 'draw', label: 'Signature', active: false },
                    { icon: 'grid_on', label: 'Matrix', active: false },
                    { icon: 'pin', label: 'OTP Input', active: true },
                    { icon: 'credit_card', label: 'Payment', active: false },
                    { icon: 'palette', label: 'Color Picker', active: true },
                    { icon: 'linear_scale', label: 'Slider', active: false },
                    { icon: 'mood', label: 'Emoji Rating', active: false },
                  ].map((field, i) => (
                    <div key={i} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all group-hover:scale-[1.02] ${
                      field.active ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-surface-container-high border-outline-variant text-on-surface-variant'
                    }`}>
                      <span className="material-symbols-outlined text-[22px]">{field.icon}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-center leading-tight">{field.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. CTA Section */}
        <section id="get-started" className="py-24 px-margin-desktop text-center bg-[#0a0a0a] border-t border-[#1a1a1a]/60">
          <div className="max-w-3xl mx-auto glass-card p-12 rounded-2xl border border-outline-variant relative overflow-hidden flex flex-col items-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
            <h2 className="font-headline-lg text-headline-lg mb-6 text-white">Ready to Build Your First Form?</h2>
            <p className="text-on-surface-variant text-body-lg mb-stack-lg">It's free to start. Pick your fields, customize the questions, and share your form in minutes.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-stack-md">
              <button
                onClick={() => navigate('/auth')}
                className="bg-on-surface text-background px-10 py-4 rounded-full font-label-md text-label-md font-bold hover:scale-105 transition-all"
              >
                Start Building
              </button>
              <button
                onClick={handleScrollToFeatures}
                className="text-on-surface border border-outline px-10 py-4 rounded-full font-label-md text-label-md hover:bg-on-surface/5 transition-all"
              >
                Explore Features
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full py-stack-lg border-t border-[#1a1a1a]/60 bg-[#0a0a0a]">
          <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop max-w-container-max mx-auto gap-stack-lg">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary text-[14px]">dataset</span>
                </div>
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">NxtForm AI</span>
              </div>
              <p className="font-label-sm text-label-sm text-on-surface-variant">© 2025 NxtForm AI. All rights reserved.</p>
            </div>
            <div className="flex gap-stack-lg">
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Privacy Policy</a>
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Terms of Service</a>
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Security</a>
              <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Contact</a>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 flex items-center justify-center rounded-full border border-outline-variant hover:bg-surface-container transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">public</span>
              </div>
              <div className="w-8 h-8 flex items-center justify-center rounded-full border border-outline-variant hover:bg-surface-container transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">share</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
