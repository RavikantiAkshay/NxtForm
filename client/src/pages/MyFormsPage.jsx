import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';
import Loader from '../components/Loader';

export default function MyFormsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const user = JSON.parse(localStorage.getItem('nxtform_user') || '{"name":"User"}');


  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/forms', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setForms(data);
        }
      } catch (error) {
        console.error('Failed to fetch forms:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchForms();
  }, []);

  const [formToDelete, setFormToDelete] = useState(null);

  const confirmDelete = async () => {
    if (!formToDelete) return;
    try {
      const response = await fetch(`http://localhost:5000/api/forms/${formToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        setForms(forms.filter(f => f._id !== formToDelete.id));
      } else {
        alert('Failed to delete form');
      }
    } catch (error) {
      console.error('Error deleting form:', error);
    } finally {
      setFormToDelete(null);
    }
  };

  const handleDeleteForm = (e, formId, formTitle) => {
    e.stopPropagation();
    setFormToDelete({ id: formId, title: formTitle });
  };


  const filteredForms = forms.filter(
    f => (f.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <div className="bg-[#050505] text-[#e5e2e1] min-h-screen flex flex-col overflow-hidden font-sans antialiased relative">
      {/* Premium Dot Matrix Background */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[#050505]">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.15]" style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}></div>
        
        {/* Elegant top spotlight glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.15),transparent)]"></div>
        
        {/* Soft fade at the bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80"></div>
      </div>

      <TopNavbar />

      <main className="flex-1 flex flex-col overflow-hidden w-full max-w-[1440px] mx-auto z-10">
        {/* Header */}
        <header className="shrink-0 px-10 py-10 bg-transparent relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">My Forms</h1>
              <p className="text-[14px] text-[#888]">Welcome back, <span className="text-[#c4b5fd] font-medium">{user.name}</span>. You have {forms.length} active forms.</p>
            </div>
          </div>

          {/* Search */}
          <div className="mt-8 relative max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#888] text-[20px]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search forms..."
              className="w-full bg-[#111]/80 backdrop-blur-xl border border-[#333] rounded-xl pl-12 pr-4 py-3.5 text-[15px] text-[#e5e2e1] placeholder:text-[#888] focus:outline-none focus:border-[#8b5cf6]/50 focus:shadow-[0_0_0_4px_rgba(139,92,246,0.1)] transition-all"
            />
          </div>
        </header>

        {/* Forms Grid */}
        <div className="flex-1 overflow-y-auto px-10 py-8 hide-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Loader text="Loading your forms..." />
            </div>
          ) : filteredForms.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
              <div className="w-24 h-24 bg-[#111] border border-[#222] rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
                <span className="material-symbols-outlined text-[48px] text-[#777]">description</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No forms found</h3>
              <p className="text-[15px] text-[#888] mb-8 leading-relaxed">
                {searchQuery ? "No forms match your search criteria. Try a different keyword." : "You haven't created any forms yet. Create your first intelligent form to get started."}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setIsAiModalOpen(true)}
                  className="bg-[#8b5cf6] text-white px-8 py-3.5 rounded-xl font-bold text-[15px] hover:bg-[#7c3aed] hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all flex items-center gap-2 hover:-translate-y-0.5"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  Create Your First Form
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredForms.map((form) => (
                <div
                  key={form._id}
                  className="bg-[#111]/80 backdrop-blur-xl border border-[#222] rounded-2xl p-6 flex flex-col hover:border-[#8b5cf6]/50 hover:bg-[#151515] hover:shadow-[0_10px_40px_-10px_rgba(139,92,246,0.15)] hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden"
                  onClick={() => navigate('/workspace/edit', { state: { formId: form._id } })}
                >
                  {/* Subtle Top Gradient Line */}
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#8b5cf6]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center group-hover:bg-[#8b5cf6]/20 group-hover:scale-105 transition-all duration-300">
                      <span className="material-symbols-outlined text-[#c4b5fd] text-[24px] group-hover:text-white transition-colors">{form.mode === 'conversational' ? 'forum' : 'view_list'}</span>
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm ${
                      form.isPublished
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                    }`}>
                      {form.isPublished ? 'Live' : 'Draft'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-[17px] font-bold text-[#f5f5f5] mb-2 group-hover:text-[#c4b5fd] transition-colors line-clamp-1">{form.title}</h3>
                  <p className="text-[13px] text-[#aaa] mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px]">view_agenda</span>
                    {form.blocks?.length || 0} fields
                    <span className="text-[#666]">•</span>
                    <span className="capitalize">{form.mode}</span>
                  </p>

                  {/* Footer Stats */}
                  <div className="mt-auto pt-5 border-t border-[#222] flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="flex items-center gap-2 text-[12px] font-medium text-[#aaa] group-hover:text-[#ccc] transition-colors">
                        <span className="material-symbols-outlined text-[16px]">bar_chart</span>
                        0 
                      </div>
                      <div className="flex items-center gap-2 text-[12px] font-medium text-[#777] group-hover:text-[#aaa] transition-colors">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        {new Date(form.updatedAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" onClick={(e) => e.stopPropagation()}>
                      {form.isPublished && (
                        <button
                          onClick={(e) => { e.stopPropagation(); window.open(`/f/${form._id}`, '_blank'); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#777] hover:text-emerald-400 hover:bg-emerald-400/15 transition-all"
                          title="Open Live Form"
                        >
                          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/${form._id}`); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#777] hover:text-[#8b5cf6] hover:bg-[#8b5cf6]/15 transition-all"
                        title="View Responses"
                      >
                        <span className="material-symbols-outlined text-[18px]">insights</span>
                      </button>
                      <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#777] hover:text-red-400 hover:bg-red-400/15 transition-all"
                        title="Delete Form"
                        onClick={(e) => handleDeleteForm(e, form._id, form.title)}
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Create New Card */}
              <div
                className="bg-transparent border-2 border-dashed border-[#333] rounded-2xl p-6 flex flex-col items-center justify-center min-h-[220px] hover:border-[#8b5cf6]/60 hover:bg-[#8b5cf6]/5 transition-all duration-300 cursor-pointer group"
                onClick={() => setIsAiModalOpen(true)}
              >
                <div className="w-14 h-14 rounded-full bg-[#111] border border-[#333] flex items-center justify-center mb-4 group-hover:bg-[#8b5cf6]/20 group-hover:border-[#8b5cf6]/40 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <span className="material-symbols-outlined text-[#666] text-[28px] group-hover:text-[#c4b5fd] transition-colors">add</span>
                </div>
                <span className="text-[15px] font-bold text-[#666] group-hover:text-[#c4b5fd] transition-colors">Create New Form</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* AI Generation Loading Overlay */}
      {isGenerating && <Loader fullScreen text="AI is crafting your form..." />}

      {/* AI Generation Modal */}
      {isAiModalOpen && !isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111] border border-[#333] rounded-2xl p-8 max-w-lg w-full shadow-2xl relative">
            <button 
              onClick={() => setIsAiModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#8b5cf6]">auto_awesome</span>
              Create New Form
            </h2>
            <p className="text-gray-400 text-sm mb-6">Choose how you'd like to build your next intelligent form.</p>
            
            <div className="flex flex-col gap-4">
              <div 
                onClick={() => { setIsAiModalOpen(false); navigate('/workspace/edit'); }}
                className="p-4 border border-[#333] rounded-xl hover:border-[#8b5cf6] hover:bg-[#8b5cf6]/10 cursor-pointer transition-colors flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-[#222] flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">edit_square</span>
                </div>
                <div>
                  <h3 className="text-white font-bold">Start from Scratch</h3>
                  <p className="text-xs text-gray-500 mt-1">Build your form manually using our drag-and-drop editor.</p>
                </div>
              </div>

              <div className="p-4 border border-[#8b5cf6]/50 bg-[#8b5cf6]/5 rounded-xl transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#8b5cf6]">smart_toy</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Build with AI</h3>
                    <p className="text-xs text-gray-400 mt-1">Describe what you need, and AI will generate the fields.</p>
                  </div>
                </div>
                
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. A job application form asking for name, email, resume, and experience..."
                  className="w-full bg-black/50 border border-[#444] rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#8b5cf6] h-24 resize-none mb-3"
                  disabled={isGenerating}
                />
                
                <button
                  onClick={async () => {
                    if(!aiPrompt.trim()) return;
                    setIsGenerating(true);
                    try {
                      const res = await fetch('http://localhost:5000/api/ai/generate-form', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        credentials: 'include',
                        body: JSON.stringify({ prompt: aiPrompt })
                      });
                      if(res.ok) {
                        const blocks = await res.json();
                        setIsAiModalOpen(false);
                        navigate('/workspace/edit', { state: { aiBlocks: blocks } });
                      } else {
                        alert('Failed to generate form. Please try again.');
                      }
                    } catch(e) {
                      console.error(e);
                      alert('An error occurred.');
                    } finally {
                      setIsGenerating(false);
                    }
                  }}
                  disabled={!aiPrompt.trim() || isGenerating}
                  className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:bg-[#222] disabled:text-[#999] disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  {isGenerating ? (
                    <><span className="material-symbols-outlined animate-spin">sync</span> Generating...</>
                  ) : (
                    <><span className="material-symbols-outlined">magic_button</span> Generate Form</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {formToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-[#111] border border-[#222] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-500">
                <span className="material-symbols-outlined text-[24px]">warning</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Delete Form</h2>
              <p className="text-[15px] text-[#888] leading-relaxed">
                Are you sure you want to delete <span className="text-white font-medium">"{formToDelete.title}"</span>? This action cannot be undone and all associated responses will be lost.
              </p>
            </div>
            <div className="px-6 py-4 bg-[#0a0a0a] border-t border-[#222] flex gap-3 justify-end">
              <button
                onClick={() => setFormToDelete(null)}
                className="px-5 py-2 rounded-lg font-medium text-[#888] hover:text-white hover:bg-[#222] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 rounded-lg font-medium bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
