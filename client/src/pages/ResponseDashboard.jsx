import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppSidebar from '../components/AppSidebar';

export default function ResponseDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Mock Submissions data
  const submissions = [
    {
      id: '#REQ-8902',
      time: '2 mins ago',
      email: 'sarah.jenkins@example.com',
      score: '9/10',
      sentiment: 'Positive',
      sentimentClass: 'bg-primary/10 text-primary border border-primary/20',
      answers: {
        satisfaction: '9/10 (Highly Satisfied)',
        speed: 'Excellent response times on mobile.',
        navigation: 'I like the overall clean violet aesthetics. Easy to read and complete.'
      }
    },
    {
      id: '#REQ-8901',
      time: '15 mins ago',
      email: 'Anonymous',
      score: '4/10',
      sentiment: 'Frustrated',
      sentimentClass: 'bg-error/10 text-error border border-error/20',
      answers: {
        satisfaction: '4/10 (Needs Improvement)',
        speed: 'It works fine but took too long to load on my Safari browser.',
        navigation: 'Where is the export data button? Took me 5 minutes of clicking around to find it.'
      }
    },
    {
      id: '#REQ-8900',
      time: '1 hr ago',
      email: 'm.chen@techcorp.io',
      score: '7/10',
      sentiment: 'Neutral',
      sentimentClass: 'bg-secondary-container text-on-secondary-container border border-outline-variant',
      answers: {
        satisfaction: '7/10 (Neutral)',
        speed: 'Standard performance, nothing out of the ordinary.',
        navigation: 'Simple form. It would be helpful if the dropdown list was pre-sorted.'
      }
    },
    {
      id: '#REQ-8899',
      time: '3 hrs ago',
      email: 'david.l@startup.co',
      score: '10/10',
      sentiment: 'Enthusiastic',
      sentimentClass: 'bg-primary/10 text-primary border border-primary/20',
      answers: {
        satisfaction: '10/10 (Extremely Satisfied)',
        speed: 'Blazing fast load speed! Less than 100ms first paint.',
        navigation: 'Outstanding UI. The glassmorphism cards and smooth field transitions are premium.'
      }
    }
  ];

  // Filter submissions by search query
  const filteredSubmissions = submissions.filter(
    sub =>
      sub.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.sentiment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#0a0a0a] text-[#e5e2e1] h-screen flex overflow-hidden font-sans antialiased">
      <AppSidebar activePage="responses" />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
          
          <header className="mb-stack-lg flex flex-col md:flex-row md:justify-between md:items-end border-b border-outline-variant pb-stack-md">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Customer Feedback Survey 2024</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Real-time response tracking and AI analysis.</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button 
                onClick={() => alert('Exporting submissions table to CSV...')}
                className="border border-outline-variant text-on-background px-4 py-2 rounded font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center space-x-2"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Export CSV</span>
              </button>
              
              <button className="bg-surface-container-high text-primary px-4 py-2 rounded font-label-md text-label-md border border-primary/30 flex items-center space-x-2 hover:bg-surface-container-highest transition-colors">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(208,188,255,0.6)]"></span>
                <span>AI Insights</span>
              </button>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-stack-lg">
            
            {/* Stat Card 1 */}
            <div className="bg-[#111] border border-[#1e1e1e] p-5 rounded-lg flex flex-col justify-between h-32 hover:border-[#8b5cf6]/20 transition-all">
              <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider flex justify-between items-center">
                Total Responses
                <span className="material-symbols-outlined text-primary text-[18px]">trending_up</span>
              </div>
              <div className="text-3xl font-bold text-white">1,248</div>
              <div className="font-label-sm text-label-sm text-primary font-semibold">+12% this week</div>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-[#111] border border-[#1e1e1e] p-5 rounded-lg flex flex-col justify-between h-32 hover:border-[#8b5cf6]/20 transition-all">
              <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider flex justify-between items-center">
                Completion Rate
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">horizontal_rule</span>
              </div>
              <div className="text-3xl font-bold text-white">84.2%</div>
              <div className="font-label-sm text-label-sm text-on-surface-variant">Stable</div>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-[#111] border border-[#1e1e1e] p-5 rounded-lg flex flex-col justify-between h-32 hover:border-[#8b5cf6]/20 transition-all">
              <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider flex justify-between items-center">
                Avg. Completion Time
                <span className="material-symbols-outlined text-error text-[18px]">trending_down</span>
              </div>
              <div className="text-3xl font-bold text-white">2m 14s</div>
              <div className="font-label-sm text-label-sm text-error font-semibold">-15s from avg</div>
            </div>

            {/* Stat Card 4 (AI Score) */}
            <div className="bg-[#111] border border-[#1e1e1e] p-5 rounded-lg flex flex-col justify-between h-32 relative overflow-hidden hover:border-[#8b5cf6]/30 transition-all">
              <div className="absolute inset-0 bg-primary/[0.04] pointer-events-none"></div>
              <div className="font-label-sm text-label-sm text-primary uppercase tracking-wider flex justify-between items-center relative z-10 font-bold">
                AI Sentiment Score
                <span className="material-symbols-outlined text-primary text-[18px]">neurology</span>
              </div>
              <div className="text-3xl font-bold text-white relative z-10">7.8<span className="text-on-surface-variant text-sm font-medium">/10</span></div>
              <div className="font-label-sm text-label-sm text-primary relative z-10 font-semibold">Positive Lean</div>
            </div>
            
          </div>

          {/* Bento Grid Layout: Chart and Theme Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-stack-lg">
            
            {/* Main SVG Area Chart */}
            <div className="lg:col-span-2 bg-[#111] border border-[#1e1e1e] rounded-lg p-6 flex flex-col h-[400px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">Response Volume</h3>
                <select className="bg-surface-container-high border border-outline-variant text-on-background text-xs rounded px-3 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>All Time</option>
                </select>
              </div>

              {/* Faux Area Chart (White background with grid & SVG path) */}
              <div className="flex-1 w-full bg-white rounded border border-outline-variant relative overflow-hidden flex items-end">
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
                  {/* Glowing purple area fill */}
                  <path d="M0,100 L0,70 Q10,60 20,80 T40,50 T60,20 T80,40 T100,10 L100,100 Z" fill="rgba(208, 188, 255, 0.25)" stroke="none"></path>
                  {/* Purple line path */}
                  <path d="M0,70 Q10,60 20,80 T40,50 T60,20 T80,40 T100,10" fill="none" stroke="#d0bcff" strokeLinecap="round" strokeWidth="2.5"></path>
                </svg>

                {/* X-axis labels */}
                <div className="absolute bottom-3 w-full flex justify-between px-6 opacity-60 z-20 text-black">
                  <span className="text-[10px] font-bold">Mon</span>
                  <span className="text-[10px] font-bold">Tue</span>
                  <span className="text-[10px] font-bold">Wed</span>
                  <span className="text-[10px] font-bold">Thu</span>
                  <span className="text-[10px] font-bold">Fri</span>
                  <span className="text-[10px] font-bold">Sat</span>
                  <span className="text-[10px] font-bold">Sun</span>
                </div>
              </div>
            </div>

            {/* Key Themes List */}
            <div className="bg-[#111] border border-[#1e1e1e] rounded-lg p-6 flex flex-col">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
                AI Key Themes
              </h3>
              
              <div className="space-y-4 flex-1">
                <div className="group border border-outline-variant rounded p-4 hover:border-primary/50 transition-colors cursor-help">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-semibold text-white text-sm">UI Navigation</span>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">42 mentions</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Users consistently mention difficulty finding the export settings in the new top bar layout.
                  </p>
                </div>

                <div className="group border border-outline-variant rounded p-4 hover:border-primary/50 transition-colors cursor-help">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-semibold text-white text-sm">Performance</span>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">18 mentions</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Positive feedback regarding dashboard loading speeds compared to last weeks version.
                  </p>
                </div>

                <div className="group border border-outline-variant rounded p-4 hover:border-primary/50 transition-colors cursor-help">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-semibold text-white text-sm">Feature: Dark Mode</span>
                    <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Resolved</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Legacy requests for dark mode settings have been addressed. The theme is now implemented globally.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Submissions Data Table */}
          <div className="bg-[#111] border border-[#1e1e1e] rounded-lg overflow-hidden">
            <div className="p-4 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container-low">
              <h3 className="text-lg font-bold text-white">Recent Submissions</h3>
              
              {/* Table search input */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search submissions..." 
                  className="bg-background border border-outline-variant rounded pl-9 pr-4 py-2 font-body-md text-body-md text-on-background focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none w-64 text-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant bg-background/50 text-on-surface-variant text-xs uppercase tracking-wider font-bold">
                    <th className="p-4 font-semibold">ID</th>
                    <th className="p-4 font-semibold">Submitted</th>
                    <th className="p-4 font-semibold">Respondent</th>
                    <th className="p-4 font-semibold">Score</th>
                    <th className="p-4 font-semibold">AI Sentiment</th>
                    <th className="p-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-on-surface-variant">
                        No submissions matching that query found.
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub) => (
                      <tr key={sub.id} className="border-b border-[#1a1a1a] hover:bg-surface-container-high/50 transition-colors">
                        <td className="p-4 font-mono text-on-surface-variant">{sub.id}</td>
                        <td className="p-4">{sub.time}</td>
                        <td className="p-4">{sub.email}</td>
                        <td className="p-4 font-bold text-white">{sub.score}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${sub.sentimentClass}`}>
                            {sub.sentiment}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => setSelectedSubmission(sub)}
                            className="text-on-surface-variant hover:text-primary p-1 focus:outline-none"
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
          <div className="w-full max-w-md bg-surface-container-low border-l border-outline-variant h-full p-8 flex flex-col justify-between shadow-2xl relative overflow-y-auto scrollbar-custom animate-slide-in">
            <div>
              {/* Close Button */}
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-white"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>

              <div className="mb-8 pr-6">
                <span className="text-xs text-primary font-mono font-bold tracking-wider">{selectedSubmission.id}</span>
                <h3 className="text-xl font-bold text-white mt-1">{selectedSubmission.email}</h3>
                <span className="text-xs text-on-surface-variant block mt-0.5">Submitted {selectedSubmission.time}</span>
              </div>

              {/* Stats badges */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-surface border border-outline-variant p-3 rounded">
                  <span className="text-[10px] uppercase text-on-surface-variant tracking-wider font-bold">Overall Rating</span>
                  <span className="text-lg font-bold block text-white mt-1">{selectedSubmission.score}</span>
                </div>
                <div className="bg-surface border border-outline-variant p-3 rounded">
                  <span className="text-[10px] uppercase text-on-surface-variant tracking-wider font-bold">AI Sentiment</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold block mt-1.5 text-center ${selectedSubmission.sentimentClass}`}>
                    {selectedSubmission.sentiment}
                  </span>
                </div>
              </div>

              {/* Answers */}
              <div className="space-y-6">
                <h4 className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider text-xs border-b border-outline-variant pb-2">Response Breakdown</h4>
                
                <div>
                  <h5 className="text-xs font-bold text-primary mb-1">Question 1: Overall Satisfaction</h5>
                  <p className="text-sm text-on-surface-variant bg-[#1a1a1a] p-3 rounded">{selectedSubmission.answers.satisfaction}</p>
                </div>
                
                <div>
                  <h5 className="text-xs font-bold text-primary mb-1">Question 2: Platform Load Speed</h5>
                  <p className="text-sm text-on-surface-variant bg-[#1a1a1a] p-3 rounded">{selectedSubmission.answers.speed}</p>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-primary mb-1">Question 3: Navigation Feedback</h5>
                  <p className="text-sm text-on-surface-variant bg-[#1a1a1a] p-3 rounded">{selectedSubmission.answers.navigation}</p>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-outline-variant flex gap-4">
              <button 
                onClick={() => alert(`Marked request ${selectedSubmission.id} as flagged for review.`)}
                className="flex-1 py-2.5 border border-outline-variant hover:border-primary text-sm font-semibold rounded hover:text-primary transition-all"
              >
                Flag Submission
              </button>
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="flex-1 py-2.5 bg-primary text-on-primary text-sm font-bold rounded hover:bg-primary-container transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
