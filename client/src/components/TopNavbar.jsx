import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function TopNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('nxtform_token');
  const isDark = location.pathname === '/' || location.pathname === '/auth';

  const handleLogout = () => {
    localStorage.removeItem('nxtform_token');
    localStorage.removeItem('nxtform_user');
    navigate('/');
  };

  const handleScroll = (id) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // The styling adjusts based on whether it's on the dark Landing Page or light Dashboard
  const navClass = isDark 
    ? "w-full top-0 sticky z-50 bg-[#131313]/80 backdrop-blur-md border-b border-outline-variant text-[#e5e2e1]"
    : "w-full top-0 sticky z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 text-gray-900 shadow-sm";

  return (
    <header className={navClass}>
      <div className="flex justify-between items-center h-16 px-6 lg:px-12 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-lg bg-[#8b5cf6] flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>dataset</span>
          </div>
          <span className={`font-headline-md text-headline-md font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>NxtForm AI</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {token ? (
            <>
              <button 
                onClick={() => navigate('/workspace')} 
                className={`font-label-md text-label-md font-bold transition-colors ${location.pathname === '/workspace' ? 'text-[#8b5cf6]' : (isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')}`}
              >
                My Forms
              </button>
              <button 
                onClick={() => navigate('/dashboard/customer-feedback')} 
                className={`font-label-md text-label-md font-bold transition-colors ${location.pathname.includes('/dashboard') ? 'text-[#8b5cf6]' : (isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')}`}
              >
                Responses
              </button>
            </>
          ) : (
            <>
              <button
                className={`font-label-md text-label-md font-bold transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                onClick={() => handleScroll('precision-engineering-section')}
              >
                Features
              </button>
              <button
                className={`font-label-md text-label-md font-bold transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                onClick={() => handleScroll('how-it-works')}
              >
                How it Works
              </button>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {token ? (
            <>
              <button
                onClick={handleLogout}
                className={`font-label-md text-label-md font-bold transition-colors ${isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`}
              >
                Logout
              </button>
              <button
                onClick={() => navigate('/workspace/edit')}
                className="bg-[#8b5cf6] text-white px-5 py-2 rounded-full font-label-md text-label-md font-bold hover:brightness-110 active:scale-95 transition-all shadow-sm"
              >
                Create Form
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/auth')}
                className={`font-label-md text-label-md font-bold transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="bg-[#8b5cf6] text-white px-5 py-2 rounded-full font-label-md text-label-md font-bold hover:brightness-110 active:scale-95 transition-all shadow-sm"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
