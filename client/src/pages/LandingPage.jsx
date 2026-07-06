import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleScrollToFeatures = (e) => {
    e.preventDefault();
    document.getElementById('precision-engineering-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#0a0a0a] text-[#e5e2e1] min-h-screen selection:bg-primary selection:text-on-primary antialiased font-body-md text-body-md overflow-x-hidden">

      {/* 1. Navigation Shell (from Sophisticated) */}
      <header className="w-full top-0 sticky z-50 bg-[#131313]/80 backdrop-blur-md border-b border-outline-variant">
        <div className="flex justify-between items-center h-16 px-margin-desktop max-w-container-max mx-auto">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>dataset</span>
            </div>
            <span className="font-headline-md text-headline-md font-bold text-on-surface">NxtForm AI</span>
          </div>

          <nav className="hidden md:flex items-center gap-stack-lg">
            <a
              className="font-label-md text-label-md text-primary font-bold border-b-2 border-primary pb-1 hover:text-primary transition-colors duration-200"
              href="#precision-engineering-section"
              onClick={handleScrollToFeatures}
            >
              Features
            </a>
            <a
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors duration-200"
              href="#how-it-works"
              onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}
            >
              How it Works
            </a>
            <a
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors duration-200"
              href="#get-started"
              onClick={(e) => { e.preventDefault(); document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' }); }}
            >
              Get Started
            </a>
          </nav>

          <div className="flex items-center gap-stack-md">
            <button
              onClick={() => navigate('/auth')}
              className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="bg-primary text-on-primary px-stack-lg py-2 rounded-full font-label-md text-label-md font-bold hover:brightness-110 active:scale-95 transition-all"
            >
              Create Form
            </button>
          </div>
        </div>
      </header>

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
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">Next Generation Data Intake</span>
              </div>

              <h1 className="font-display-lg text-[40px] lg:text-[44px] mb-6 leading-tight text-white">
                Data Intelligence, <br /><span className="violet-gradient-text">Refined.</span>
              </h1>

              <p className="font-body-lg text-[16px] text-on-surface-variant mb-8 max-w-xl">
                NxtForm AI leverages neural logic to create adaptive intake experiences that think with your users. Eliminate friction and capture insights, not just inputs.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-start gap-4">
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full sm:w-auto bg-primary text-on-primary px-8 py-3.5 rounded-xl font-label-md text-label-md font-bold text-[16px] hover:shadow-[0_0_30px_rgba(208,188,255,0.4)] transition-all"
                >
                  Launch Experience
                </button>
                <button
                  onClick={handleScrollToFeatures}
                  className="w-full sm:w-auto border border-outline text-on-surface px-8 py-3.5 rounded-xl font-label-md text-label-md text-[16px] hover:bg-white/5 transition-all"
                >
                  View Showcases
                </button>
              </div>
            </div>

            {/* Right Column: Floating Form Preview (Visual Anchor) */}
            <div className="col-span-12 lg:col-span-7 w-full">
              <div className="glass-card rounded-2xl p-6 border border-outline-variant/30 shadow-2xl relative overflow-hidden group">
                <div className="flex items-center justify-between mb-6 border-b border-outline-variant pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
                    </div>
                    <span className="text-on-surface-variant font-label-sm">Intelligent Customer Onboarding</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                    <span className="text-primary font-label-sm">AI Engine Active</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 text-left">
                    <div className="space-y-1.5">
                      <label className="text-on-surface font-label-md">Dynamic Industry Context</label>
                      <div className="p-3 bg-surface-container-lowest border border-outline-variant rounded-xl flex items-center justify-between group-hover:border-primary/50 transition-colors">
                        <span className="text-on-surface">Software Engineering</span>
                        <span className="material-symbols-outlined text-on-surface-variant text-[18px]">expand_more</span>
                      </div>
                    </div>
                    <div className="space-y-1.5 animate-pulse opacity-50">
                      <label className="text-on-surface font-label-md">Suggested Experience Level</label>
                      <div className="p-3 bg-surface-container-lowest border border-outline-variant rounded-xl flex items-center justify-between">
                        <span className="text-on-surface-variant">Senior Lead</span>
                        <span className="material-symbols-outlined text-on-surface-variant text-[18px]">magic_button</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-container rounded-xl p-5 border border-outline-variant flex flex-col justify-center text-left">
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="material-symbols-outlined text-primary text-[16px]">psychology</span>
                        <span className="font-label-sm text-primary uppercase">Adaptive Flow</span>
                      </div>
                      <h3 className="font-headline-md text-[18px] mb-1.5 text-white">Refining fields based on "Software"</h3>
                      <p className="text-on-surface-variant text-label-sm">The system has automatically expanded the technical stack requirements and hidden non-relevant general sections.</p>
                    </div>
                    <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-2/3"></div>
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
              <h2 className="font-mono text-headline-lg uppercase mb-6 tracking-tighter text-white">Autonomous <br />Onboarding</h2>
              <p className="text-on-surface-variant font-mono text-body-md mb-8">
                Observe the 'Customer Onboarding Flow'. Fields highlighted in <span className="text-[#8b5cf6] font-bold">Electric Violet</span> are automatically inferred from user session metadata and peripheral API signals.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 font-mono text-label-md uppercase tracking-wider text-on-surface">
                  <span className="w-2 h-2 bg-[#8b5cf6]"></span> 0.4s Response Latency
                </li>
                <li className="flex items-center gap-3 font-mono text-label-md uppercase tracking-wider text-on-surface">
                  <span className="w-2 h-2 bg-[#8b5cf6]"></span> Geo-Spatial Intelligence
                </li>
                <li className="flex items-center gap-3 font-mono text-label-md uppercase tracking-wider text-on-surface">
                  <span className="w-2 h-2 bg-[#8b5cf6]"></span> Behavioral Prediction
                </li>
              </ul>
            </div>

            <div className="col-span-12 md:col-span-8">
              <div className="glass-module p-6 lg:p-8 relative overflow-hidden bg-[#0a0a0a] border-2 border-outline-variant rounded-none text-left">
                <div className="absolute top-0 left-0 p-3 border-r-2 border-b-2 border-outline-variant font-mono text-label-sm uppercase opacity-50">
                  Flow_Preview_01
                </div>
                <div className="space-y-5 mt-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-mono text-label-sm uppercase text-on-surface-variant">Full Legal Name</label>
                      <div className="bg-[#0a0a0a] border-2 border-outline-variant p-3 text-on-surface-variant font-body-md rounded-none">Alex Sterling</div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-mono text-label-sm uppercase text-[#8b5cf6] font-bold">Company Domain (AI INFERRED)</label>
                      <div className="bg-[#0a0a0a] border-2 border-[#8b5cf6] p-3 text-[#8b5cf6] font-body-md flex justify-between items-center rounded-none">
                        asterling.tech
                        <span className="material-symbols-outlined text-[18px]">bolt</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-label-sm uppercase text-[#8b5cf6] font-bold">Primary Objective (PREDICTED)</label>
                    <div className="bg-[#0a0a0a] border-2 border-[#8b5cf6] p-3 text-[#8b5cf6] font-body-md flex justify-between items-center rounded-none">
                      Enterprise API Infrastructure Deployment
                      <span className="material-symbols-outlined text-[18px]">psychology</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5 col-span-2">
                      <label className="font-mono text-label-sm uppercase text-on-surface-variant">Integration Stack</label>
                      <div className="flex gap-2">
                        <span className="border border-outline-variant px-2.5 py-1 font-mono text-label-sm uppercase rounded-none">Node.js</span>
                        <span className="border border-outline-variant px-2.5 py-1 font-mono text-label-sm uppercase rounded-none">React</span>
                        <span className="border border-[#8b5cf6] bg-[#8b5cf6]/10 px-2.5 py-1 font-mono text-label-sm uppercase text-[#8b5cf6] rounded-none">Python</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-mono text-label-sm uppercase text-on-surface-variant">Team Size</label>
                      <div className="bg-[#0a0a0a] border-2 border-outline-variant p-3 text-on-surface-variant font-body-md text-center rounded-none">50-200</div>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-outline-variant flex justify-end">
                    <button
                      onClick={() => navigate('/auth')}
                      className="bg-[#8b5cf6] text-[#0a0a0a] px-6 py-2.5 font-mono text-label-md font-bold uppercase tracking-widest active:scale-95 transition-transform rounded-none hover:bg-[#a78bfa]"
                    >
                      Confirm Configuration
                    </button>
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
            <h2 className="font-headline-lg text-headline-lg mb-4 text-white">Precision Engineering</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto">Designed for the world's most demanding interfaces, combining AI intelligence with architectural elegance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-stack-lg h-auto md:h-[450px]">
            {/* Bento Item 1 */}
            <div className="md:col-span-7 glass-card rounded-2xl p-6 lg:p-8 border border-outline-variant flex flex-col justify-between hover:bg-surface-container-high/80 transition-all duration-500 group text-left">
              <div className="max-w-md">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>neurology</span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-2.5 text-white">Neural Pathfinding</h3>
                <p className="text-on-surface-variant text-body-md">Our forms learn from every interaction. If a user hesitates, the interface subtly adapts its phrasing to ensure clarity and completion.</p>
              </div>
              <div className="mt-6 flex gap-4">
                <div className="bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 text-primary text-label-sm">Active Learning</div>
                <div className="bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 text-primary text-label-sm">Semantic Logic</div>
              </div>
            </div>

            {/* Bento Item 2 */}
            <div className="md:col-span-5 bg-surface-container-high rounded-2xl p-6 lg:p-8 border border-outline-variant flex flex-col justify-center relative overflow-hidden group text-left">
              <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                <span className="material-symbols-outlined text-[100px] text-primary">security</span>
              </div>
              <div className="relative z-10">
                <h3 className="font-headline-md text-headline-md mb-2.5 text-white">Fortified Privacy</h3>
                <p className="text-on-surface-variant text-body-md">Zero-knowledge proofs and end-to-end encryption for every data point collected.</p>
                <a className="inline-flex items-center gap-2 mt-4 text-primary font-label-md hover:gap-3 transition-all" href="#">
                  Security Protocols <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </a>
              </div>
            </div>

            {/* Bento Item 3 */}
            <div className="md:col-span-4 glass-card rounded-2xl p-6 border border-outline-variant flex flex-col items-center text-center justify-center hover:shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-4 border border-outline-variant">
                <span className="material-symbols-outlined text-on-surface text-[24px]">speed</span>
              </div>
              <h3 className="font-label-md text-label-md font-bold uppercase tracking-widest mb-2 text-white">99.8% Completion</h3>
              <p className="text-on-surface-variant text-label-md">Industry leading throughput with AI assistance.</p>
            </div>

            {/* Bento Item 4 */}
            <div className="md:col-span-8 bg-surface-container-lowest rounded-2xl p-6 lg:p-8 border border-outline-variant flex flex-col md:flex-row items-center gap-6 hover:border-primary/40 transition-colors text-left">
              <div className="flex-1">
                <h3 className="font-headline-md text-headline-md mb-2.5 text-white">Enterprise Grade Scaling</h3>
                <p className="text-on-surface-variant text-body-md">Whether it's 10 or 10 million responses, our infrastructure handles the load with millisecond latency.</p>
              </div>
              <div className="flex-shrink-0 grid grid-cols-2 gap-4">
                <div className="w-20 h-20 rounded-2xl bg-surface-container border border-outline-variant flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-primary font-bold text-[18px]">5ms</div>
                    <div className="text-[10px] text-on-surface-variant uppercase">Latency</div>
                  </div>
                </div>
                <div className="w-20 h-20 rounded-2xl bg-surface-container border border-outline-variant flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-primary font-bold text-[18px]">32x</div>
                    <div className="text-[10px] text-on-surface-variant uppercase">Growth</div>
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
              <h2 className="font-headline-lg text-headline-lg font-semibold text-on-surface mb-4 text-white">Engineered for the Modern Web</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">Skip the drag-and-drop. Describe your ideal data structure, and our AI constructs a high-performance, dynamic interface in seconds.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {/* Feature 1 */}
              <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-8 flex flex-col h-full glow-hover hover:shadow-[0_0_20px_rgba(208,188,255,0.15)] hover:border-[#494454] transition-all duration-300 text-left">
                <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center mb-6 border border-outline-variant/30">
                  <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-3 text-white">Architected for Speed</h3>
                <p className="font-body-md text-body-md text-on-surface-variant flex-grow">Forms render at edge speeds. Zero bloat, compiled React components delivered instantly to your users, ensuring zero drop-off.</p>
                <div className="mt-6 pt-6 border-t border-[#1e1e1e]">
                  <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider flex items-center gap-1 cursor-pointer">View Benchmarks <span className="material-symbols-outlined text-[14px]">chevron_right</span></span>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-8 flex flex-col h-full glow-hover hover:shadow-[0_0_20px_rgba(208,188,255,0.15)] hover:border-[#494454] transition-all duration-300 relative overflow-hidden text-left">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center mb-6 border border-outline-variant/30 relative z-10">
                  <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>schema</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-3 relative z-10 text-white">AI Schema Engine</h3>
                <p className="font-body-md text-body-md text-on-surface-variant flex-grow relative z-10">Input plain text requirements. The engine automatically generates complex validation logic, JSON schemas, and backend routing rules.</p>
                <div className="mt-6 p-3 bg-[#0a0a0a] border border-[#1e1e1e] rounded font-mono text-[12px] text-on-surface-variant relative z-10 overflow-hidden">
                  <code className="!bg-transparent !p-0 !text-[12px] !text-on-surface-variant !inline-block whitespace-nowrap">{`{ "type": "object", "strict": true }`}</code>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-8 flex flex-col h-full glow-hover hover:shadow-[0_0_20px_rgba(208,188,255,0.15)] hover:border-[#494454] transition-all duration-300 text-left">
                <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center mb-6 border border-outline-variant/30">
                  <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-3 text-white">Instant Insights</h3>
                <p className="font-body-md text-body-md text-on-surface-variant flex-grow">Don't just collect data, understand it. AI synthesizes responses in real-time, providing immediate semantic analysis and sentiment scoring.</p>
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
              <h2 className="font-display-lg text-[40px] mb-stack-lg leading-tight text-white">Adaptive Interfaces That <span className="text-primary">Evolve.</span></h2>
              <p className="text-body-lg text-on-surface-variant mb-stack-lg">
                Gone are the days of static, rigid forms. NxtForm AI creates a conversation between you and your data. The interface reconfigures in real-time, surfacing only the most relevant questions based on context, intent, and previous answers.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                  <div>
                    <h4 className="font-label-md text-label-md font-bold text-on-surface">Context-Aware Logic</h4>
                    <p className="text-label-md text-on-surface-variant">Fields mutate and transform based on user input for a frictionless path.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                  <div>
                    <h4 className="font-label-md text-label-md font-bold text-on-surface">Predictive Assistance</h4>
                    <p className="text-label-md text-on-surface-variant">AI anticipates the next data point, suggesting completions to save time.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="relative flex justify-center">
              {/* Complex UI Visual Mock */}
              <div className="w-full max-w-lg aspect-square glass-card rounded-[2rem] p-stack-lg border border-primary/20 relative group overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 blur-[80px] rounded-full"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/10 blur-[80px] rounded-full"></div>
                <div className="relative z-10 space-y-6 text-left">
                  <div className="p-6 bg-surface-container-high border border-outline-variant rounded-2xl transform group-hover:-translate-y-2 transition-transform">
                    <div className="h-2 w-24 bg-outline-variant rounded-full mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 w-full bg-surface-container-highest rounded-lg"></div>
                      <div className="h-4 w-3/4 bg-surface-container-highest rounded-lg"></div>
                    </div>
                  </div>
                  <div className="p-6 bg-primary/10 border border-primary/40 rounded-2xl transform translate-x-12 group-hover:translate-x-16 transition-transform">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-primary text-sm">spark</span>
                      <div className="h-2 w-32 bg-primary/30 rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-10 bg-primary/20 rounded-lg"></div>
                      <div className="h-10 bg-primary/20 rounded-lg"></div>
                      <div className="h-10 bg-primary rounded-lg shadow-lg shadow-primary/20"></div>
                    </div>
                  </div>
                  <div className="p-6 bg-surface-container-high border border-outline-variant rounded-2xl transform -translate-x-8 group-hover:-translate-x-12 transition-transform">
                    <div className="h-2 w-16 bg-outline-variant rounded-full mb-4"></div>
                    <div className="h-12 w-full bg-surface-container-highest rounded-lg flex items-center px-4">
                      <div className="w-2 h-2 rounded-full bg-primary mr-3 pulse-dot"></div>
                      <div className="h-2 w-1/2 bg-outline-variant rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. CTA Section */}
        <section id="get-started" className="py-24 px-margin-desktop text-center bg-[#0a0a0a] border-t border-[#1a1a1a]/60">
          <div className="max-w-3xl mx-auto glass-card p-12 rounded-2xl border border-outline-variant relative overflow-hidden flex flex-col items-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
            <h2 className="font-headline-lg text-headline-lg mb-6 text-white">Ready for the Future of Data?</h2>
            <p className="text-on-surface-variant text-body-lg mb-stack-lg">Join 2,000+ industry leaders building high-performance intake engines with NxtForm AI.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-stack-md">
              <button
                onClick={() => navigate('/auth')}
                className="bg-on-surface text-background px-10 py-4 rounded-full font-label-md text-label-md font-bold hover:scale-105 transition-all"
              >
                Get Started Free
              </button>
              <button className="text-on-surface border border-outline px-10 py-4 rounded-full font-label-md text-label-md hover:bg-on-surface/5 transition-all">
                Schedule Demo
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
              <p className="font-label-sm text-label-sm text-on-surface-variant">© 2024 NxtForm AI. All rights reserved.</p>
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
