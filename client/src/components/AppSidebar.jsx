import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AppSidebar({ activePage = 'forms' }) {
  const navigate = useNavigate();

  const navItems = [
    { id: 'forms', icon: 'grid_view', label: 'My Forms', path: '/workspace' },
    { id: 'builder', icon: 'edit_document', label: 'Builder', path: '/workspace/edit' },
    { id: 'responses', icon: 'bar_chart', label: 'Responses', path: '/dashboard/customer-feedback' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('nxtform_token');
    localStorage.removeItem('nxtform_user');
    navigate('/');
  };

  return (
    <nav className="h-screen w-[60px] bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col items-center py-4 shrink-0 z-50">
      {/* Logo */}
      <div 
        className="mb-8 cursor-pointer group"
        onClick={() => navigate('/')}
        title="NxtForm AI — Home"
      >
        <div className="w-9 h-9 rounded-xl bg-[#8b5cf6] flex items-center justify-center group-hover:shadow-[0_0_16px_rgba(139,92,246,0.4)] transition-all">
          <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>dataset</span>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 flex flex-col items-center gap-1 w-full px-2">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex flex-col items-center justify-center py-2.5 rounded-lg transition-all relative group ${
                isActive
                  ? 'bg-[#8b5cf6]/10 text-[#8b5cf6]'
                  : 'text-[#555] hover:text-[#999] hover:bg-[#111]'
              }`}
              title={item.label}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#8b5cf6] rounded-r-full"></div>
              )}
              <span 
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="text-[9px] mt-0.5 font-medium tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom: Logout */}
      <div className="flex flex-col items-center gap-2 w-full px-2">
        <button
          onClick={handleLogout}
          className="w-full flex flex-col items-center justify-center py-2.5 rounded-lg text-[#555] hover:text-red-400 hover:bg-red-400/5 transition-all"
          title="Logout"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="text-[9px] mt-0.5 font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
}
