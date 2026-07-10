import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';
import Loader from '../components/Loader';

export default function ResponseDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOutliers, setFilterOutliers] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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
        
        // Handle "Other" option
        const isOther = Array.isArray(val) ? val.includes('__other__') : val === '__other__';
        if (isOther) {
          const otherAns = sub.answers.find(a => a.blockId === `${block.id}_other`);
          if (otherAns && otherAns.value) {
            if (Array.isArray(val)) {
              val = val.map(v => v === '__other__' ? `Other: ${otherAns.value}` : v);
            } else {
              val = `Other: ${otherAns.value}`;
            }
          }
        }

        let stringVal = Array.isArray(val) ? val.join('; ') : String(val);
        
        // Prevent CSV injection
        if (/^[=+\-@]/.test(stringVal)) {
          stringVal = "'" + stringVal;
        }
        
        row.push(`"${stringVal.replace(/"/g, '""')}"`);
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
        const resObj = { _id: r._id };
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

  useEffect(() => {
    if (responses.length > 0) {
      const lastViewed = localStorage.getItem(`lastViewed_${id}`);
      if (lastViewed) {
        const lastViewedDate = new Date(lastViewed);
        const newResps = responses.filter(r => new Date(r.createdAt) > lastViewedDate);
        setUnreadCount(newResps.length);
      } else {
        setUnreadCount(responses.length);
      }
      
      const timer = setTimeout(() => {
        localStorage.setItem(`lastViewed_${id}`, new Date().toISOString());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [responses, id]);

  const getLastActivity = () => {
    if (responses.length === 0) return 'Never';
    const sorted = [...responses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const lastDate = new Date(sorted[0].createdAt);
    const now = new Date();
    
    // Normalize to midnight to calculate calendar day differences
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastDateDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
    const diffDays = Math.round((today - lastDateDay) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today, ${lastDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    } else if (diffDays === 1) {
      return `Yesterday, ${lastDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    } else {
      return `${diffDays} Days Ago`;
    }
  };

  const getBottleneckQuestion = () => {
    if (!form || !form.blocks || responses.length === 0) return { title: 'N/A', skips: 0 };
    let mostSkipped = null;
    let maxSkips = -1;

    form.blocks.forEach(block => {
      let skips = 0;
      responses.forEach(sub => {
        const ans = sub.answers.find(a => a.blockId === block.id);
        if (!ans || !ans.value || (Array.isArray(ans.value) && ans.value.length === 0)) {
          skips++;
        }
      });
      if (skips > maxSkips) {
        maxSkips = skips;
        mostSkipped = block;
      }
    });
    return { title: mostSkipped ? mostSkipped.title : 'N/A', skips: maxSkips };
  };

  const bottleneck = getBottleneckQuestion();

  const filteredSubmissions = responses.filter(sub => {
    const matchesSearch = sub._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.userId?.email || 'Anonymous').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterOutliers && insights?.outliers) {
      return matchesSearch && insights.outliers.includes(sub._id);
    }
    return matchesSearch;
  });

  const itemsPerPage = 20;
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterOutliers]);

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
                className="bg-[#1a1a1a] text-[#d0bcff] px-4 py-2 rounded text-sm border border-[#d0bcff]/30 flex items-center space-x-2 hover:bg-[#262626] transition-colors disabled:bg-[#222] disabled:text-[#999] disabled:border-[#444] disabled:cursor-not-allowed"
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

          {/* Insightful Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Total Responses */}
            <div className="bg-[#111] border border-[#1e1e1e] p-5 rounded-lg flex flex-col justify-between h-32 hover:border-[#8b5cf6]/20 transition-all group">
              <div className="text-xs text-[#8a8494] uppercase tracking-wider flex justify-between items-center">
                Total Responses
                <span className="material-symbols-outlined text-[#d0bcff] text-[18px] group-hover:-translate-y-0.5 transition-transform">monitoring</span>
              </div>
              <div className="text-3xl font-bold text-white">{responses.length}</div>
              <div className="text-xs text-[#d0bcff] font-semibold">Track completion targets</div>
            </div>

            {/* Unread / New */}
            <div className="bg-[#111] border border-[#1e1e1e] p-5 rounded-lg flex flex-col justify-between h-32 hover:border-[#8b5cf6]/20 transition-all group">
              <div className="text-xs text-[#8a8494] uppercase tracking-wider flex justify-between items-center">
                Unread / New
                <span className="material-symbols-outlined text-[#10b981] text-[18px] group-hover:scale-110 transition-transform">mark_email_unread</span>
              </div>
              <div className="text-3xl font-bold text-white">
                {unreadCount} <span className="text-lg text-[#10b981] font-medium">New</span>
              </div>
              <div className="text-xs text-[#8a8494]">Since your last visit</div>
            </div>

            {/* Last Activity */}
            <div className="bg-[#111] border border-[#1e1e1e] p-5 rounded-lg flex flex-col justify-between h-32 hover:border-[#8b5cf6]/20 transition-all">
              <div className="text-xs text-[#8a8494] uppercase tracking-wider flex justify-between items-center">
                Last Activity
                <span className="material-symbols-outlined text-[#8a8494] text-[18px]">history</span>
              </div>
              <div className="text-lg font-bold text-white mt-2 leading-tight">
                {getLastActivity()}
              </div>
              <div className="text-xs text-[#8a8494] mt-auto">Most recent submission</div>
            </div>

            {/* AI Outliers / Flags */}
            <div 
              onClick={() => {
                if (insights?.outliers) setFilterOutliers(!filterOutliers);
              }}
              className={`border p-5 rounded-lg flex flex-col justify-between h-32 transition-all relative overflow-hidden ${insights ? 'cursor-pointer hover:bg-[#1a1525]' : 'opacity-70'} ${filterOutliers ? 'bg-[#1a1525] border-[#8b5cf6] shadow-[0_0_15px_rgba(139,92,246,0.15)]' : 'bg-[#111] border-[#1e1e1e] hover:border-[#8b5cf6]/40'}`}
            >
              {insights && <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 to-transparent pointer-events-none"></div>}
              <div className="text-xs text-[#d0bcff] uppercase tracking-wider flex justify-between items-center relative z-10 font-bold">
                AI Outliers / Flags
                <span className="material-symbols-outlined text-[#d0bcff] text-[18px]">{filterOutliers ? 'filter_alt_off' : 'filter_alt'}</span>
              </div>
              <div className="text-3xl font-bold text-white relative z-10">
                {insights ? (
                  <>{insights.outliers?.length || 0} <span className="text-lg text-[#d0bcff] font-medium">Flagged</span></>
                ) : 'N/A'}
              </div>
              <div className="text-xs text-[#d0bcff] relative z-10 font-semibold">{insights ? (filterOutliers ? 'Click to clear filter' : 'Click to filter table') : 'Run AI Insights to scan'}</div>
            </div>
            
          </div>

          {/* Bento Grid Layout: Chart and Theme Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Friction Tracker (Bottleneck Question) */}
            <div className="lg:col-span-2 bg-[#111] border border-[#1e1e1e] rounded-lg p-6 flex flex-col justify-between h-[400px] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#f43f5e]/5 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#f43f5e]">warning</span>
                    Friction Tracker
                  </h3>
                  <p className="text-sm text-[#8a8494] mt-1">Identifies the biggest bottleneck in your form conversion.</p>
                </div>
                <span className="bg-[#221518] border border-[#3e1b23] text-[#f43f5e] text-xs rounded px-3 py-1.5 font-bold">
                  Highest Drop-off
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
                {bottleneck.skips > 0 ? (
                  <>
                    <div className="text-5xl mb-4">🚧</div>
                    <h4 className="text-2xl font-bold text-white mb-2 max-w-lg leading-tight">"{bottleneck.title}"</h4>
                    <p className="text-[#8a8494] text-lg">
                      Most skipped / left blank (<span className="text-[#f43f5e] font-bold">{bottleneck.skips} times</span>)
                    </p>
                    <div className="mt-6 text-sm text-[#a19ba8] bg-[#1a1516] border border-[#3e1b23] px-4 py-3 rounded-lg max-w-md">
                      <strong>Insight:</strong> If a quarter of the group skips this optional question, it usually means it was confusing, or they didn't have the files ready. Consider rephrasing or removing it.
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-5xl mb-4">✅</div>
                    <h4 className="text-xl font-bold text-white mb-2">No Bottlenecks Detected</h4>
                    <p className="text-[#8a8494]">Every question has been answered by all respondents so far.</p>
                  </>
                )}
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
                  <div className="h-full flex flex-col items-center justify-center text-[#888] text-sm text-center">
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
                  {paginatedSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-[#8a8494]">
                        No submissions matching that query found.
                      </td>
                    </tr>
                  ) : (
                    paginatedSubmissions.map((sub) => (
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
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-[#1e1e1e] flex justify-between items-center bg-[#0c0c0c]">
                <span className="text-sm text-[#8a8494]">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredSubmissions.length)} of {filteredSubmissions.length} entries
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded bg-[#111] border border-[#222] text-[#e5e2e1] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1a1a1a] transition-colors text-sm"
                  >
                    Previous
                  </button>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded bg-[#111] border border-[#222] text-[#e5e2e1] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1a1a1a] transition-colors text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
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
                  } else if (typeof displayVal === 'object' && displayVal !== null) {
                    displayVal = JSON.stringify(displayVal);
                  } else {
                    displayVal = String(displayVal);
                  }
                  
                  // if they selected 'Other' option
                  const isOther = Array.isArray(ans?.value) ? ans.value.includes('__other__') : ans?.value === '__other__';
                  let otherText = '';
                  if (isOther) {
                     const otherAns = selectedSubmission.answers.find(a => a.blockId === `${block.id}_other`);
                     if (otherAns) otherText = ` (Other: ${otherAns.value})`;
                  }

                  return (
                    <div key={block.id} className="mb-6 bg-[#111] p-4 rounded-xl border border-[#222]">
                      <h4 className="text-sm font-bold text-white mb-2">{block.title}</h4>
                      <div className="text-[#a19ba8] text-sm whitespace-pre-wrap max-h-48 overflow-y-auto scrollbar-custom bg-[#0c0c0c] p-3 rounded-lg border border-[#1a1a1a]">
                        {displayVal}{otherText}
                      </div>
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
