import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';
import Loader from '../components/Loader';

export default function ResponseDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [insights, setInsights] = useState(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const formRes = await fetch(`http://localhost:5000/api/forms/${id}`, { credentials: 'include' });
        if (!formRes.ok) throw new Error('Form not found');
        const formData = await formRes.json();
        setForm(formData);

        const respRes = await fetch(`http://localhost:5000/api/responses/${id}/all`, { credentials: 'include' });
        if (respRes.ok) {
          const respData = await respRes.json();
          setResponses(respData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [id]);

  const handleExportCSV = () => {
    if (!form || responses.length === 0) {
      alert("No responses to export.");
      return;
    }
    
    // Build CSV Header from form blocks
    const headers = ['Submission ID', 'Submitted At', 'Respondent Email', ...form.blocks.map(b => b.title)];
    
    const rows = responses.map(sub => {
      const row = [
        sub._id,
        new Date(sub.createdAt).toLocaleString(),
        sub.userId?.email || 'Anonymous'
      ];
      
      form.blocks.forEach(block => {
        const answer = sub.answers.find(a => a.blockId === block.id);
        let val = answer ? answer.value : '';
        if (Array.isArray(val)) val = val.join('; ');
        row.push(`"${String(val).replace(/"/g, '""')}"`);
      });
      return row.join(',');
    });
    
    const csvContent = [headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${form.title.replace(/[^a-z0-9]/gi, '_')}_Responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateInsights = async () => {
    if (responses.length === 0) {
      alert('Not enough responses to generate insights.');
      return;
    }
    
    setIsGeneratingInsights(true);
    try {
      const mappedResponses = responses.map(r => {
        const resObj = {};
        r.answers.forEach(a => {
          const block = form.blocks.find(b => b.id === a.blockId);
          if (block) resObj[block.title] = a.value;
        });
        return resObj;
      });

      const res = await fetch(`http://localhost:5000/api/ai/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          formTitle: form.title,
          blocks: form.blocks.map(b => ({ title: b.title, type: b.type })),
          responses: mappedResponses
        })
      });

      if (!res.ok) throw new Error('Failed to generate insights');
      
      const data = await res.json();
      setInsights(data);
    } catch (error) {
      console.error(error);
      alert('Failed to generate insights. Ensure you have provided valid inputs.');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  if (isLoading) {
    return <Loader fullScreen text="Loading Dashboard..." />;
  }

  if (!form) {
    return (
      <div className="bg-[#0a0a0a] text-white min-h-screen flex items-center justify-center flex-col">
        <h2 className="text-xl font-bold mb-4">Dashboard not found or unauthorized.</h2>
        <button onClick={() => navigate('/workspace')} className="text-primary hover:underline">Go back to Workspace</button>
      </div>
    );
  }

  const filteredSubmissions = responses.filter(
    sub =>
      sub._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.userId?.email || 'Anonymous').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#0a0a0a] text-[#e5e2e1] min-h-screen flex flex-col overflow-hidden font-sans antialiased">
      <TopNavbar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 w-full max-w-[1440px] mx-auto">
          
          <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end border-b border-[#1e1e1e] pb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{form.title} - Responses</h1>
              <p className="text-sm text-[#8a8494]">Real-time response tracking and AI analysis.</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button 
                onClick={handleExportCSV}
                className="border border-[#1e1e1e] text-white px-4 py-2 rounded text-sm hover:bg-[#1a1a1a] transition-colors flex items-center space-x-2"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Export CSV</span>
              </button>
              
              <button 
                onClick={handleGenerateInsights}
                disabled={isGeneratingInsights || responses.length === 0}
                className="bg-[#1a1a1a] text-[#d0bcff] px-4 py-2 rounded text-sm border border-[#d0bcff]/30 flex items-center space-x-2 hover:bg-[#262626] transition-colors disabled:opacity-50"
              >
                {isGeneratingInsights ? (
                  <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-[#d0bcff] animate-pulse shadow-[0_0_8px_rgba(208,188,255,0.6)]"></span>
                )}
                <span>{isGeneratingInsights ? 'Analyzing...' : 'AI Insights'}</span>
              </button>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            <div className="bg-[#111] border border-[#1e1e1e] p-5 rounded-lg flex flex-col justify-between h-32 hover:border-[#8b5cf6]/20 transition-all">
              <div className="text-xs text-[#8a8494] uppercase tracking-wider flex justify-between items-center">
                Total Responses
                <span className="material-symbols-outlined text-[#d0bcff] text-[18px]">trending_up</span>
              </div>
              <div className="text-3xl font-bold text-white">{responses.length}</div>
              <div className="text-xs text-[#d0bcff] font-semibold">Real-time count</div>
            </div>

            <div className="bg-[#111] border border-[#1e1e1e] p-5 rounded-lg flex flex-col justify-between h-32 hover:border-[#8b5cf6]/20 transition-all">
              <div className="text-xs text-[#8a8494] uppercase tracking-wider flex justify-between items-center">
                Average Completion Rate
                <span className="material-symbols-outlined text-[#8a8494] text-[18px]">horizontal_rule</span>
              </div>
              <div className="text-3xl font-bold text-white">100%</div>
              <div className="text-xs text-[#8a8494]">All saved are completed</div>
            </div>

            {/* AI Score */}
            <div className="bg-[#111] border border-[#1e1e1e] p-5 rounded-lg flex flex-col justify-between h-32 relative overflow-hidden hover:border-[#8b5cf6]/30 transition-all">
              <div className="absolute inset-0 bg-[#d0bcff]/[0.04] pointer-events-none"></div>
              <div className="text-xs text-[#d0bcff] uppercase tracking-wider flex justify-between items-center relative z-10 font-bold">
                AI Average Score
                <span className="material-symbols-outlined text-[#d0bcff] text-[18px]">neurology</span>
              </div>
              <div className="text-3xl font-bold text-white relative z-10">
                {insights ? insights.averageScore : 'N/A'}
              </div>
              <div className="text-xs text-[#d0bcff] relative z-10 font-semibold">Out of 10</div>
            </div>

            {/* AI Sentiment */}
            <div className="bg-[#111] border border-[#1e1e1e] p-5 rounded-lg flex flex-col justify-between h-32 relative overflow-hidden hover:border-[#8b5cf6]/30 transition-all">
              <div className="absolute inset-0 bg-[#d0bcff]/[0.04] pointer-events-none"></div>
              <div className="text-xs text-[#d0bcff] uppercase tracking-wider flex justify-between items-center relative z-10 font-bold">
                Overall Sentiment
                <span className="material-symbols-outlined text-[#d0bcff] text-[18px]">psychology</span>
              </div>
              <div className="text-xl font-bold text-white relative z-10 mt-2">
                {insights ? (
                  <span className={`px-2 py-1 rounded text-sm ${insights.sentimentClass || 'bg-[#222] text-white'}`}>
                    {insights.sentiment}
                  </span>
                ) : 'N/A'}
              </div>
              <div className="text-xs text-[#d0bcff] relative z-10 font-semibold mt-auto">Analyzed by AI</div>
            </div>
            
          </div>

          {/* Bento Grid Layout: Chart and Theme Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Main SVG Area Chart */}
            <div className="lg:col-span-2 bg-[#111] border border-[#1e1e1e] rounded-lg p-6 flex flex-col h-[400px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">Response Volume</h3>
                <span className="bg-[#1a1a1a] border border-[#333] text-white text-xs rounded px-3 py-1.5">
                  All Time
                </span>
              </div>

              {/* Faux Area Chart (White background with grid & SVG path) */}
              <div className="flex-1 w-full bg-white rounded border border-[#e5e4e7] relative overflow-hidden flex items-end">
                {/* Horizontal grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between opacity-[0.08] pointer-events-none py-8">
                  <div className="w-full h-px bg-black"></div>
                  <div className="w-full h-px bg-black"></div>
                  <div className="w-full h-px bg-black"></div>
                  <div className="w-full h-px bg-black"></div>
                  <div className="w-full h-px bg-black"></div>
                </div>

                {/* SVG Graph path */}
                <svg className="absolute bottom-0 w-full h-[80%] z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M0,100 L0,70 Q10,60 20,80 T40,50 T60,20 T80,40 T100,10 L100,100 Z" fill="rgba(208, 188, 255, 0.25)" stroke="none"></path>
                  <path d="M0,70 Q10,60 20,80 T40,50 T60,20 T80,40 T100,10" fill="none" stroke="#d0bcff" strokeLinecap="round" strokeWidth="2.5"></path>
                </svg>
              </div>
            </div>

            {/* Key Themes List */}
            <div className="bg-[#111] border border-[#1e1e1e] rounded-lg p-6 flex flex-col">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-[#d0bcff] text-xl">auto_awesome</span>
                AI Key Themes
              </h3>
              
              <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {!insights ? (
                  <div className="h-full flex flex-col items-center justify-center text-[#555] text-sm text-center">
                    <span className="material-symbols-outlined text-4xl mb-2">query_stats</span>
                    <p>Click "AI Insights" above to analyze the responses.</p>
                  </div>
                ) : insights.themes && insights.themes.length > 0 ? (
                  insights.themes.map((theme, idx) => (
                    <div key={idx} className="group border border-[#222] rounded p-4 hover:border-[#d0bcff]/50 transition-colors">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-semibold text-white text-sm">{theme.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${theme.tagClass || 'bg-[#222] text-white'}`}>
                          {theme.mentions} mentions
                        </span>
                      </div>
                      <p className="text-xs text-[#8a8494] leading-relaxed">
                        {theme.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#8a8494]">No themes could be extracted.</p>
                )}
              </div>
            </div>

          </div>

          {/* Submissions Data Table */}
          <div className="bg-[#111] border border-[#1e1e1e] rounded-lg overflow-hidden">
            <div className="p-4 border-b border-[#1e1e1e] flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#0c0c0c]">
              <h3 className="text-lg font-bold text-white">Recent Submissions</h3>
              
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8a8494] text-[18px]">search</span>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search submissions..." 
                  className="bg-[#050505] border border-[#222] rounded pl-9 pr-4 py-2 text-[#e5e2e1] focus:border-[#d0bcff] focus:ring-1 focus:ring-[#d0bcff] focus:outline-none w-64 text-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1e1e1e] bg-[#050505]/50 text-[#8a8494] text-xs uppercase tracking-wider font-bold">
                    <th className="p-4 font-semibold">ID</th>
                    <th className="p-4 font-semibold">Submitted At</th>
                    <th className="p-4 font-semibold">Respondent</th>
                    <th className="p-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-[#8a8494]">
                        No submissions matching that query found.
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub) => (
                      <tr key={sub._id} className="border-b border-[#1a1a1a] hover:bg-[#111] transition-colors">
                        <td className="p-4 font-mono text-[#8a8494]">#{sub._id.slice(-6).toUpperCase()}</td>
                        <td className="p-4 text-[#e5e2e1]">{new Date(sub.createdAt).toLocaleString()}</td>
                        <td className="p-4 text-[#e5e2e1]">{sub.userId?.email || 'Anonymous'}</td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => setSelectedSubmission(sub)}
                            className="text-[#8a8494] hover:text-[#d0bcff] p-1 focus:outline-none"
                            title="View Answers"
                          >
                            <span className="material-symbols-outlined text-lg">visibility</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

      </main>

      {/* Submission Detail Slide-Out Panel (Drawer) */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-[#0a0a0a] border-l border-[#222] h-full p-8 flex flex-col justify-between shadow-2xl relative overflow-y-auto scrollbar-custom animate-[slideIn_0.3s_ease-out]">
            <div>
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="absolute top-4 right-4 text-[#8a8494] hover:text-white"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>

              <div className="mb-8 pr-6">
                <span className="text-xs text-[#d0bcff] font-mono font-bold tracking-wider">#{selectedSubmission._id.slice(-6).toUpperCase()}</span>
                <h3 className="text-xl font-bold text-white mt-1">{selectedSubmission.userId?.email || 'Anonymous'}</h3>
                <span className="text-xs text-[#8a8494] block mt-0.5">Submitted {new Date(selectedSubmission.createdAt).toLocaleString()}</span>
              </div>

              <div className="space-y-6">
                <h4 className="text-[#e5e2e1] uppercase tracking-wider text-xs border-b border-[#222] pb-2 font-bold">Response Breakdown</h4>
                
                {form.blocks.map(block => {
                  const ans = selectedSubmission.answers.find(a => a.blockId === block.id);
                  let displayVal = ans ? ans.value : 'No answer provided';
                  if (Array.isArray(displayVal)) {
                    displayVal = displayVal.join(', ');
                  }
                  
                  // if they selected 'Other' option
                  const isOther = Array.isArray(ans?.value) ? ans.value.includes('__other__') : ans?.value === '__other__';
                  let otherText = '';
                  if (isOther) {
                     const otherAns = selectedSubmission.answers.find(a => a.blockId === `${block.id}_other`);
                     if (otherAns) otherText = ` (Other: ${otherAns.value})`;
                  }

                  return (
                    <div key={block.id}>
                      <h5 className="text-xs font-bold text-[#d0bcff] mb-1">{block.title}</h5>
                      <p className="text-sm text-[#e5e2e1] bg-[#111] border border-[#222] p-3 rounded break-words">
                        {String(displayVal)}{otherText}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-[#222] flex gap-4">
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="flex-1 py-2.5 bg-[#d0bcff] text-black text-sm font-bold rounded hover:bg-white transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
