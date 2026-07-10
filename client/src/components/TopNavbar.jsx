import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function TopNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('isAuthenticated');

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('isAuthenticated');
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

  // The styling is consistent across the dark-themed platform
  const navClass = "w-full top-0 sticky z-50 bg-[#131313]/80 backdrop-blur-md border-b border-outline-variant text-[#e5e2e1]";

  return (
    <header className={navClass}>
      <div className="flex justify-between items-center h-16 px-6 lg:px-12 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-lg bg-[#8b5cf6] flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>dataset</span>
          </div>
          <span className="font-headline-md text-headline-md font-bold text-white">NxtForm AI</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {isAuthenticated ? (
            <>
              <button 
                onClick={() => navigate('/')} 
                className={`font-label-md text-label-md font-bold transition-colors ${location.pathname === '/' ? 'text-[#8b5cf6]' : 'text-gray-400 hover:text-white'}`}
              >
                Home
              </button>
              <button 
                onClick={() => navigate('/workspace')} 
                className={`font-label-md text-label-md font-bold transition-colors ${location.pathname === '/workspace' ? 'text-[#8b5cf6]' : 'text-gray-400 hover:text-white'}`}
              >
                My Forms
              </button>
            </>
          ) : (
            <>
              <button
                className="font-label-md text-label-md font-bold transition-colors text-gray-400 hover:text-white"
                onClick={() => handleScroll('precision-engineering-section')}
              >
                Features
              </button>
              <button
                className="font-label-md text-label-md font-bold transition-colors text-gray-400 hover:text-white"
                onClick={() => handleScroll('how-it-works')}
              >
                How it Works
              </button>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <button
                onClick={handleLogout}
                className="font-label-md text-label-md font-bold transition-colors text-gray-400 hover:text-red-400"
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
                className="font-label-md text-label-md font-bold transition-colors text-gray-400 hover:text-white"
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
