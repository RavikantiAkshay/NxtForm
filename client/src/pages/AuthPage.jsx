import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const payload = isSignUp 
        ? { name, username, email, password }
        : { email, password };

      const res = await fetch(`${apiUrl.replace('/api', '')}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('nxtform_user', JSON.stringify({ 
        _id: data._id,
        name: data.name, 
        username: data.username,
        email: data.email 
      }));
      
      navigate('/workspace');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const maskStyle = {
    maskImage: 'radial-gradient(ellipse 80% 75% at 55% 45%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0) 70%)',
    WebkitMaskImage: 'radial-gradient(ellipse 80% 75% at 55% 45%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0) 70%)',
  };

  return (
    <div className="bg-[#050505] text-[#e5e2e1] h-screen flex antialiased selection:bg-primary-container selection:text-on-primary-container font-sans relative overflow-hidden">
      
      {/* Left Panel — 62% width, illustration floats behind text */}
      <div className="hidden lg:flex lg:w-[62%] relative bg-[#050505] overflow-hidden">
        
        {/* Illustration — absolute, anchored to the right side of the panel */}
        <div className="absolute top-1/2 left-[36%] -translate-y-1/2 w-[68%] max-w-[580px] pointer-events-none z-[1]">
          <img 
            src="/auth-illustration.png" 
            alt=""
            className="w-full h-auto opacity-[0.55]"
            style={maskStyle}
          />
        </div>

        {/* Ambient glow that ties illustration to the page */}
        <div className="absolute top-[25%] right-[10%] w-[400px] h-[400px] bg-[#8b5cf6] rounded-full blur-[200px] opacity-[0.06] pointer-events-none z-0"></div>
        <div className="absolute bottom-[20%] left-[5%] w-[300px] h-[300px] bg-[#6d28d9] rounded-full blur-[160px] opacity-[0.04] pointer-events-none z-0"></div>

        {/* Text content — sits on the left side, clean and readable */}
        <div className="relative z-10 flex flex-col justify-center pl-12 xl:pl-16 pr-8 py-10 max-w-[420px]">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 mb-10 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>dataset</span>
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-white">NxtForm AI</span>
          </div>

          {/* Headline */}
          <h1 className="text-[26px] xl:text-[30px] font-bold text-white mb-4 leading-[1.2] font-display">
            {isSignUp 
              ? <>Building forms shouldn't be <span className="text-[#a78bfa]">this hard.</span></> 
              : <>Struggling to build forms that <span className="text-[#a78bfa]">actually work?</span></>}
          </h1>

          {/* Problem statement */}
          <p className="text-[14px] text-[#8a8494] leading-relaxed mb-8">
            {isSignUp 
              ? "Rigid layouts, complex validation, endless developer back-and-forth — even simple forms take hours. Every small change breaks something else."
              : "Rigid templates, tangled logic, layouts that break on every edit — traditional form builders make simple tasks painfully hard."}
          </p>

          {/* What NxtForm solves — compact features */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#8b5cf6] text-[18px] mt-0.5 flex-shrink-0">auto_awesome</span>
              <div>
                <span className="text-[13px] font-semibold text-white">Describe it, NxtForm builds it.</span>
                <span className="text-[13px] text-[#6b6577] ml-1">AI generates production-ready forms from plain text.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#8b5cf6] text-[18px] mt-0.5 flex-shrink-0">edit_note</span>
              <div>
                <span className="text-[13px] font-semibold text-white">Edit without breaking.</span>
                <span className="text-[13px] text-[#6b6577] ml-1">Drag, reorder, change logic — live preview updates instantly.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#8b5cf6] text-[18px] mt-0.5 flex-shrink-0">share</span>
              <div>
                <span className="text-[13px] font-semibold text-white">Publish & track.</span>
                <span className="text-[13px] text-[#6b6577] ml-1">One-click share, real-time response dashboard.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — 38% width, auth form */}
      <div className="w-full lg:w-[38%] flex items-center justify-center p-6 md:p-10 relative bg-[#050505] border-l border-[#1a1a1a]">
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle, #e5e2e1 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }}></div>

        <div className="w-full max-w-[340px] relative z-10">
          {/* Header */}
          <div className="mb-7">
            {/* Mobile-only logo */}
            <div className="flex items-center gap-2 mb-5 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>dataset</span>
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-white">NxtForm AI</span>
            </div>

            <h2 className="font-display text-[22px] font-bold text-white tracking-tight">
              {isSignUp ? "Create your workspace" : "Welcome back"}
            </h2>
            <p className="text-[14px] text-[#6b6577] mt-1">
              {isSignUp ? "Start building smarter forms in minutes." : "Sign in to continue to your workspace."}
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-[13px] font-medium">
                {error}
              </div>
            )}
            
            {isSignUp && (
              <>
                <div>
                  <label className="block text-[13px] font-medium text-[#8a8494] mb-1.5" htmlFor="name">Full Name</label>
                  <input 
                    className="w-full bg-[#0c0c0c] border border-[#222] rounded-lg px-3.5 py-2.5 text-[#e5e2e1] focus:outline-none focus:border-[#8b5cf6]/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] text-[14px] transition-all duration-200 placeholder:text-[#3a3a3a]" 
                    id="name" 
                    type="text" 
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#8a8494] mb-1.5" htmlFor="username">Username</label>
                  <input 
                    className="w-full bg-[#0c0c0c] border border-[#222] rounded-lg px-3.5 py-2.5 text-[#e5e2e1] focus:outline-none focus:border-[#8b5cf6]/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] text-[14px] transition-all duration-200 placeholder:text-[#3a3a3a]" 
                    id="username" 
                    type="text" 
                    placeholder="Choose a unique username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            
            <div>
              <label className="block text-[13px] font-medium text-[#8a8494] mb-1.5" htmlFor="email">Email</label>
              <input 
                className="w-full bg-[#0c0c0c] border border-[#222] rounded-lg px-3.5 py-2.5 text-[#e5e2e1] focus:outline-none focus:border-[#8b5cf6]/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] text-[14px] transition-all duration-200 placeholder:text-[#3a3a3a]" 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[13px] font-medium text-[#8a8494]" htmlFor="password">Password</label>
                {!isSignUp && (
                  <button type="button" className="text-[12px] text-[#8b5cf6] hover:text-[#a78bfa] transition-colors">Forgot?</button>
                )}
              </div>
              <input 
                className="w-full bg-[#0c0c0c] border border-[#222] rounded-lg px-3.5 py-2.5 text-[#e5e2e1] focus:outline-none focus:border-[#8b5cf6]/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] text-[14px] transition-all duration-200 placeholder:text-[#3a3a3a]" 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#8b5cf6] text-white py-2.5 px-4 rounded-lg font-semibold text-[14px] hover:bg-[#7c3aed] hover:shadow-[0_0_24px_rgba(139,92,246,0.25)] transition-all duration-200 mt-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
              {isSignUp ? 'Create Workspace' : 'Sign In'}
            </button>
          </form>

          {/* Switcher */}
          <div className="mt-5 text-center">
            <p className="text-[13px] text-[#6b6577]">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
              <button 
                type="button" 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[#8b5cf6] hover:text-[#a78bfa] font-semibold focus:outline-none transition-colors"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>

          <p className="text-center text-[11px] text-[#333] mt-6">
            By continuing, you agree to NxtForm's Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
