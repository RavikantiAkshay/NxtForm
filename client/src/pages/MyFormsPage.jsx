import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';

export default function MyFormsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const user = JSON.parse(localStorage.getItem('nxtform_user') || '{"name":"User"}');

  // Mock forms data
  const forms = [
    {
      id: 'customer-feedback',
      title: 'Customer Feedback Survey 2024',
      description: 'Annual satisfaction survey with AI sentiment analysis for product improvement.',
      status: 'published',
      responses: 1248,
      createdAt: 'Jun 15, 2024',
      updatedAt: '2 hours ago',
      icon: 'rate_review',
    },
    {
      id: 'product-launch',
      title: 'Product Launch Registration',
      description: 'Pre-launch signup form with smart field validation and interest tracking.',
      status: 'draft',
      responses: 0,
      createdAt: 'Jul 01, 2024',
      updatedAt: '5 mins ago',
      icon: 'rocket_launch',
    },
    {
      id: 'employee-satisfaction',
      title: 'Employee Satisfaction Q4',
      description: 'Quarterly internal pulse survey with anonymous sentiment scoring.',
      status: 'published',
      responses: 356,
      createdAt: 'May 22, 2024',
      updatedAt: '1 day ago',
      icon: 'groups',
    },
    {
      id: 'event-rsvp',
      title: 'Tech Summit RSVP',
      description: 'Event registration with dietary preferences, session selection, and QR ticketing.',
      status: 'published',
      responses: 89,
      createdAt: 'Jun 28, 2024',
      updatedAt: '3 days ago',
      icon: 'event',
    },
  ];

  const filteredForms = forms.filter(
    f => f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
         f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#0a0a0a] text-[#e5e2e1] min-h-screen flex flex-col overflow-hidden font-sans antialiased">
      <TopNavbar />

      <main className="flex-1 flex flex-col overflow-hidden w-full max-w-[1440px] mx-auto">
        {/* Header */}
        <header className="shrink-0 px-8 py-6 border-b border-[#1a1a1a]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">My Forms</h1>
              <p className="text-[13px] text-[#6b6577]">Welcome back, {user.name}. You have {forms.length} forms.</p>
            </div>
          </div>

          {/* Search */}
          <div className="mt-5 relative max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#444] text-[18px]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search forms..."
              className="w-full bg-[#111] border border-[#1e1e1e] rounded-lg pl-10 pr-4 py-2.5 text-[14px] text-[#e5e2e1] placeholder:text-[#3a3a3a] focus:outline-none focus:border-[#8b5cf6]/40 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.06)] transition-all"
            />
          </div>
        </header>

        {/* Forms Grid */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {filteredForms.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="material-symbols-outlined text-[56px] text-[#222] mb-4">description</span>
              <h3 className="text-lg font-semibold text-[#555] mb-2">No forms found</h3>
              <p className="text-[13px] text-[#444] mb-6 max-w-xs">
                {searchQuery ? "No forms match your search." : "Create your first intelligent form to get started."}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => navigate('/workspace/edit')}
                  className="bg-[#8b5cf6] text-white px-5 py-2.5 rounded-lg font-semibold text-[14px] hover:bg-[#7c3aed] transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Create Form
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredForms.map((form) => (
                <div
                  key={form.id}
                  className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5 flex flex-col hover:border-[#8b5cf6]/30 hover:shadow-[0_0_24px_rgba(139,92,246,0.06)] transition-all group cursor-pointer"
                  onClick={() => navigate('/workspace/edit')}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#8b5cf6]/8 border border-[#1e1e1e] flex items-center justify-center group-hover:bg-[#8b5cf6]/15 transition-colors">
                      <span className="material-symbols-outlined text-[#8b5cf6] text-[20px]">{form.icon}</span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                      form.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {form.status === 'published' ? '● Published' : '● Draft'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-[15px] font-semibold text-white mb-1.5 group-hover:text-[#c4b5fd] transition-colors">{form.title}</h3>
                  <p className="text-[12px] text-[#6b6577] leading-relaxed mb-4 line-clamp-2">{form.description}</p>

                  {/* Footer Stats */}
                  <div className="mt-auto pt-4 border-t border-[#1a1a1a] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#555]">
                        <span className="material-symbols-outlined text-[14px]">forum</span>
                        {form.responses} responses
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#555]">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {form.updatedAt}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/dashboard/${form.id}`)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-[#555] hover:text-[#8b5cf6] hover:bg-[#8b5cf6]/10 transition-all"
                        title="View Responses"
                      >
                        <span className="material-symbols-outlined text-[16px]">bar_chart</span>
                      </button>
                      <button
                        className="w-7 h-7 rounded-md flex items-center justify-center text-[#555] hover:text-red-400 hover:bg-red-400/10 transition-all"
                        title="Delete"
                        onClick={() => alert(`Delete ${form.title}?`)}
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Create New Card */}
              <div
                className="border border-dashed border-[#1e1e1e] rounded-xl p-5 flex flex-col items-center justify-center min-h-[200px] hover:border-[#8b5cf6]/40 hover:bg-[#8b5cf6]/[0.02] transition-all cursor-pointer group"
                onClick={() => navigate('/workspace/edit')}
              >
                <div className="w-12 h-12 rounded-xl bg-[#111] border border-[#1e1e1e] flex items-center justify-center mb-3 group-hover:bg-[#8b5cf6]/10 group-hover:border-[#8b5cf6]/20 transition-all">
                  <span className="material-symbols-outlined text-[#444] text-[24px] group-hover:text-[#8b5cf6] transition-colors">add</span>
                </div>
                <span className="text-[13px] font-medium text-[#444] group-hover:text-[#8b5cf6] transition-colors">Create New Form</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
