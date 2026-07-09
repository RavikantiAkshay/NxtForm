import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Select from 'react-select';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import ISO6391 from 'iso-639-1';

countries.registerLocale(enLocale);

const SignaturePad = ({ onChange }) => {
  const canvasRef = React.useRef(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [history, setHistory] = React.useState([]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL();
    
    setHistory(prev => [...prev, dataUrl]);
    onChange(dataUrl);
  };

  const undo = () => {
    if (history.length === 0) return;
    const newHistory = [...history];
    newHistory.pop(); // remove last stroke
    setHistory(newHistory);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (newHistory.length > 0) {
      const img = new Image();
      img.src = newHistory[newHistory.length - 1];
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        onChange(newHistory[newHistory.length - 1]);
      };
    } else {
      onChange(null);
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHistory([]);
    onChange(null);
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#111827';
  }, []);

  return (
    <div className="relative border-2 border-gray-200 rounded h-32 bg-gray-50 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair touch-none relative z-10"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <div className="absolute bottom-2 right-2 flex gap-3 z-20">
        <button 
          type="button" 
          disabled={history.length === 0}
          className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${history.length === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-900'}`}
          onClick={undo}
        >
          Undo
        </button>
        <button 
          type="button" 
          disabled={history.length === 0}
          className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${history.length === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-900'}`}
          onClick={clear}
        >
          Clear
        </button>
      </div>
      {history.length === 0 && !isDrawing && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40 text-gray-400 z-0">
          <span className="text-xs select-none">Draw signature here</span>
        </div>
      )}
    </div>
  );
};


const PublishedForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [previewData, setPreviewData] = useState({});
  const [formMode, setFormMode] = useState('classic');
  const [blocks, setBlocks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Use desktop classes for the published version
  const previewDevice = 'desktop';

  useEffect(() => {
    const fetchFormAndData = async () => {
      try {
        const token = localStorage.getItem('nxtform_token');
        const headers = { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const formRes = await fetch(`http://localhost:5000/api/forms/${id}`);
        if (!formRes.ok) throw new Error('Failed to fetch form');
        const formData = await formRes.json();
        setForm(formData);
        
        if (formData.isPublished) {
          setFormMode(formData.mode || 'classic');
          setBlocks(formData.blocks || []);
          if (formData.mode === 'conversational' && formData.blocks?.length > 0) {
            setActiveBlockId(formData.blocks[0].id);
          }
          
          if (token) {
            try {
               const myRes = await fetch(`http://localhost:5000/api/responses/${id}/my-response`, { headers });
               if (myRes.ok) {
                 const myData = await myRes.json();
                 if (myData && myData.answers) {
                   const formattedData = {};
                   myData.answers.forEach(item => {
                     formattedData[item.blockId] = item.value;
                   });
                   setPreviewData(formattedData);
                 }
               }
            } catch (err) {
               console.error('No existing response found or error fetching it');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching form details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFormAndData();
  }, [id]);

  const updatePreviewData = (blockId, value) => {
    setPreviewData(prev => ({ ...prev, [blockId]: value }));
  };

  const visibleBlocks = formMode === 'classic' 
    ? blocks.filter(b => b.page === currentPage)
    : [];

  const totalPages = blocks.reduce((acc, curr) => Math.max(acc, curr.page || 1), 1);
  const activeBlock = formMode === 'conversational' ? blocks.find(b => b.id === activeBlockId) : null;

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('nxtform_token');
      const answersArray = Object.entries(previewData).map(([blockId, value]) => ({ blockId, value }));
      
      const response = await fetch(`http://localhost:5000/api/responses/${id}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers: answersArray })
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to submit response');
      }
      setIsSuccess(true);
    } catch (error) {
      console.error('Submission failed:', error);
      alert(error.message || 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading form...</div>;
  }

  if (!form) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Form not found.</div>;
  }

  if (!form.isPublished) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white flex-col gap-4">
        <span className="material-symbols-outlined text-6xl text-gray-500">visibility_off</span>
        <h2 className="text-2xl font-bold">This form is no longer accepting responses.</h2>
    </div>;
  }

  if (isSuccess) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white flex-col gap-4">
        <span className="material-symbols-outlined text-6xl text-green-500">check_circle</span>
        <h2 className="text-2xl font-bold">Response Submitted Successfully!</h2>
        <button onClick={() => navigate('/workspace')} className="mt-4 px-6 py-2 bg-white text-black font-bold rounded-sm">Go to Dashboard</button>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center py-10">
            <div className={`relative bg-black transition-all duration-300 overflow-hidden shadow-2xl flex flex-col ${previewDevice === 'mobile'
                ? 'w-[340px] h-[650px] rounded-[36px] border-[6px] border-[#262626]'
                : 'w-[90%] h-[90%] rounded-xl border border-[#262626]'
              }`}>
              {/* Notch */}
              {previewDevice === 'mobile' && (
                <div className="absolute top-0 inset-x-0 h-5 flex justify-center z-50">
                  <div className="w-28 h-5 bg-[#262626] rounded-b-xl"></div>
                </div>
              )}

              {/* Screen Content */}
              <div className={`flex-1 flex flex-col relative overflow-y-auto hide-scrollbar text-gray-900 text-left ${previewDevice === 'desktop' ? 'bg-[#f5f5f5] items-center py-10 px-8' : 'bg-white pt-10 pb-6 px-5'}`}>
                <div className={`flex flex-col flex-1 w-full ${previewDevice === 'desktop' ? 'max-w-3xl bg-white shadow-sm rounded-xl p-10 border border-gray-200' : ''}`}>
                {/* Progress bar */}
                <div className="w-full h-1 bg-gray-100 mb-6 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-900 transition-all duration-300"
                    style={{
                      width: formMode === 'conversational' && blocks.filter(b => b.type !== 'welcome').length > 0
                        ? (activeBlock?.type === 'welcome' ? '0%' : `${((blocks.filter(b => b.type !== 'welcome').findIndex(b => b.id === activeBlockId) + 1) / blocks.filter(b => b.type !== 'welcome').length) * 100}%`)
                        : '100%'
                    }}
                  ></div>
                </div>

                {/* Mode indicator in preview */}
                <div className="text-[9px] uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[10px]">{formMode === 'conversational' ? 'swipe_up' : 'view_agenda'}</span>
                  {formMode === 'conversational' && blocks.length > 0
                    ? (activeBlock?.type === 'welcome'
                      ? 'Welcome Screen'
                      : `Question ${blocks.filter(b => b.type !== 'welcome').findIndex(b => b.id === activeBlockId) + 1} of ${blocks.filter(b => b.type !== 'welcome').length}`)
                    : `All fields · Page ${currentPage}`}
                </div>

                {/* Displaying active block content — Conversational: single block, Classic: all blocks */}
                <div className="flex-1 flex flex-col justify-start pb-4">
                  {visibleBlocks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                      <p className="text-sm">Empty Form</p>
                    </div>
                  ) : (formMode === 'conversational' ? [activeBlock] : visibleBlocks).map((renderBlock, idx) => {
                    const activeBlock = renderBlock;
                    if (!activeBlock) return null;
                    return (
                      <div key={activeBlock.id} className={formMode === 'classic' ? 'mb-10 last:mb-0' : 'flex-1 flex flex-col justify-start'}>
                        {activeBlock.type === 'welcome' && (
                          <div className="text-center pt-8">
                            <span className="material-symbols-outlined text-primary text-[48px] mb-4">waving_hand</span>
                            <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-3">{activeBlock.title}</h2>
                            <p className="text-xs text-gray-500 leading-relaxed mb-8">{activeBlock.description}</p>
                            {formMode === 'conversational' && (
                              <button
                                onClick={() => {
                                  if (visibleBlocks.length > 1) {
                                    setActiveBlockId(visibleBlocks[1].id);
                                  }
                                }}
                                className="px-6 py-2 bg-gray-900 text-white font-label-md text-label-md w-full rounded-sm"
                              >
                                {activeBlock.buttonText || 'Start'}
                              </button>
                            )}
                          </div>
                        )}

                        {activeBlock.type === 'rating' && (
                          <div>
                            <h2 className="text-base font-bold text-gray-900 mb-6 leading-snug">
                              {activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}
                            </h2>
                            <div className="space-y-2">
                              {activeBlock.options?.map((opt, i) => (
                                <div
                                  key={i}
                                  onClick={() => updatePreviewData(activeBlock.id, opt.value)}
                                  className={`w-full py-3 border flex items-center justify-center gap-2 cursor-pointer transition-colors ${previewData[activeBlock.id] === opt.value ? 'border-2 border-gray-900 bg-gray-50 font-bold' : 'border-gray-200 hover:border-gray-900'
                                    }`}
                                >
                                  <span className="font-bold">{opt.value}</span>
                                  {opt.label && <span className="text-[10px] text-gray-500 uppercase font-semibold">{opt.label}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {activeBlock.type === 'longtext' && (
                          <div>
                            <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}</h2>
                            <textarea
                              value={previewData[activeBlock.id] || ''}
                              onChange={(e) => updatePreviewData(activeBlock.id, e.target.value)}
                              placeholder={activeBlock.placeholder || "Type your response here..."}
                              className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900 transition-colors h-32 resize-y"
                            />
                          </div>
                        )}

                        {['text', 'email', 'number', 'phone', 'url', 'password', 'company'].includes(activeBlock.type) && (
                          <div>
                            <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}</h2>
                            <input
                              type={activeBlock.type === 'text' ? 'text' : (activeBlock.type === 'company' ? 'text' : activeBlock.type)}
                              value={previewData[activeBlock.id] || ''}
                              autoComplete={activeBlock.type === 'password' ? 'new-password' : 'off'}
                              data-lpignore="true"
                              data-1p-ignore="true"
                              onChange={(e) => {
                                let val = e.target.value;
                                if (activeBlock.type === 'phone') {
                                  val = val.replace(/\D/g, ''); // Numeric only for phone
                                }
                                updatePreviewData(activeBlock.id, val);
                              }}
                              placeholder={activeBlock.placeholder || `Enter ${activeBlock.type}...`}
                              className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900 transition-colors"
                            />
                            {activeBlock.type === 'email' && previewData[activeBlock.id] && !previewData[activeBlock.id].includes('@') && (
                              <p className="text-red-500 text-[10px] font-bold mt-2">Please include an '@' in the email address.</p>
                            )}
                          </div>
                        )}

                        {activeBlock.type === 'checkbox' && (
                          <div>
                            <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}</h2>
                            <div className="space-y-2">
                              {activeBlock.options?.map((opt, i) => {
                                const isChecked = previewData[activeBlock.id]?.includes(opt.value);
                                return (
                                  <div
                                    key={i}
                                    onClick={() => {
                                      const current = previewData[activeBlock.id] || [];
                                      const next = current.includes(opt.value)
                                        ? current.filter(v => v !== opt.value)
                                        : [...current, opt.value];
                                      updatePreviewData(activeBlock.id, next);
                                    }}
                                    className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors ${isChecked ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-400'}`}
                                  >
                                    <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${isChecked ? 'bg-gray-900 border-gray-900' : 'border-gray-300'}`}>
                                      {isChecked && <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>}
                                    </span>
                                    <span className={`text-sm ${isChecked ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>{opt.label}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {(activeBlock.type === 'country' || activeBlock.type === 'language') && (
                          <div>
                            <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}</h2>
                            <Select
                              value={
                                activeBlock.type === 'country'
                                  ? previewData[activeBlock.id]
                                    ? { value: previewData[activeBlock.id], label: countries.getName(previewData[activeBlock.id], 'en') }
                                    : null
                                  : previewData[activeBlock.id]
                                    ? { value: previewData[activeBlock.id], label: previewData[activeBlock.id] }
                                    : null
                              }
                              onChange={(selectedOption) => updatePreviewData(activeBlock.id, selectedOption.value)}
                              options={
                                activeBlock.type === 'country'
                                  ? Object.entries(countries.getNames('en')).map(([code, name]) => ({ value: code, label: name }))
                                  : ISO6391.getAllNames().map((name) => ({ value: name, label: name }))
                              }
                              placeholder={`Select ${activeBlock.type}...`}
                              styles={{
                                control: (baseStyles, state) => ({
                                  ...baseStyles,
                                  backgroundColor: '#f9fafb',
                                  borderColor: state.isFocused ? '#111827' : '#e5e7eb',
                                  boxShadow: state.isFocused ? '0 0 0 1px #111827' : 'none',
                                  padding: '2px',
                                  borderRadius: '0.375rem',
                                  '&:hover': {
                                    borderColor: '#111827'
                                  }
                                })
                              }}
                            />
                          </div>
                        )}



                        {activeBlock.type === 'date_range' && (() => {
                          const dateVal = previewData[activeBlock.id];
                          const d = dateVal || {};
                          const activePicker = d.activePicker || null;
                          const pickerView = d.pickerView || 'day';
                          const viewYear = d.viewYear || new Date().getFullYear();
                          const viewMonth = d.viewMonth !== undefined ? d.viewMonth : new Date().getMonth();
                          const setD = (patch) => updatePreviewData(activeBlock.id, { ...d, ...patch });

                          const renderCalendar = (target) => {
                            const selData = d[target] || {};
                            const selYear = viewYear;
                            const selMonth = viewMonth;
                            const selDay = selData.day || null;

                            const daysInMonth = new Date(selYear, selMonth + 1, 0).getDate();
                            const firstDayOfWeek = new Date(selYear, selMonth, 1).getDay();
                            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                            const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                            const yearStart = Math.floor(selYear / 16) * 16;

                            return (
                              <div className="mt-2 rounded-lg overflow-hidden shadow-xl" style={{ backgroundColor: '#282828', color: '#e0e0e0', width: '100%' }}>
                                <div className="flex items-center justify-between px-4 py-3">
                                  <button
                                    type="button"
                                    onClick={() => setD({ pickerView: pickerView === 'day' ? 'year' : (pickerView === 'month' ? 'year' : 'day') })}
                                    className="text-white text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-opacity"
                                  >
                                    {pickerView === 'year' ? `${yearStart} – ${yearStart + 15}` : pickerView === 'month' ? selYear : `${monthNames[selMonth]} ${selYear}`}
                                    <span className="material-symbols-outlined text-[16px]">{pickerView === 'day' ? 'arrow_drop_down' : 'arrow_drop_up'}</span>
                                  </button>
                                  {pickerView === 'day' && (
                                    <div className="flex gap-1">
                                      <button type="button" onClick={() => setD({ viewMonth: selMonth === 0 ? 11 : selMonth - 1, viewYear: selMonth === 0 ? selYear - 1 : selYear })} className="w-7 h-7 flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                      </button>
                                      <button type="button" onClick={() => setD({ viewMonth: selMonth === 11 ? 0 : selMonth + 1, viewYear: selMonth === 11 ? selYear + 1 : selYear })} className="w-7 h-7 flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                      </button>
                                    </div>
                                  )}
                                  {pickerView === 'year' && (
                                    <div className="flex gap-1">
                                      <button type="button" onClick={() => setD({ viewYear: selYear - 16 })} className="w-7 h-7 flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                      </button>
                                      <button type="button" onClick={() => setD({ viewYear: selYear + 16 })} className="w-7 h-7 flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {pickerView === 'year' && (
                                  <div className="grid grid-cols-4 gap-1 px-3 pb-4">
                                    {Array.from({ length: 16 }, (_, i) => yearStart + i).map(yr => (
                                      <button
                                        key={yr}
                                        type="button"
                                        onClick={() => { setD({ viewYear: yr, pickerView: 'month' }); }}
                                        className={`py-2 rounded-full text-sm transition-colors ${yr === selYear ? 'bg-white/20 text-white font-bold' : 'text-gray-300 hover:bg-white/10'}`}
                                      >
                                        {yr}
                                      </button>
                                    ))}
                                  </div>
                                )}

                                {pickerView === 'month' && (
                                  <div className="grid grid-cols-3 gap-1 px-3 pb-4">
                                    {monthNames.map((m, i) => (
                                      <button
                                        key={m}
                                        type="button"
                                        onClick={() => { setD({ viewMonth: i, pickerView: 'day' }); }}
                                        className={`py-3 rounded-full text-sm transition-colors ${i === selMonth ? 'bg-white/20 text-white font-bold' : 'text-gray-300 hover:bg-white/10'}`}
                                      >
                                        {m.slice(0, 3)}
                                      </button>
                                    ))}
                                  </div>
                                )}

                                {pickerView === 'day' && (
                                  <div className="px-3 pb-4">
                                    <div className="grid grid-cols-7 mb-1">
                                      {dayLabels.map((label, i) => (
                                        <div key={i} className="text-center text-[11px] font-medium py-1" style={{ color: '#9aa0a6' }}>{label}</div>
                                      ))}
                                    </div>
                                    <div className="grid grid-cols-7">
                                      {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
                                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                                        const isToday = day === new Date().getDate() && selMonth === new Date().getMonth() && selYear === new Date().getFullYear();
                                        const isSelected = day === selData.day && selMonth === selData.month && selYear === selData.year;

                                        const sd = d.start?.day ? new Date(d.start.year, d.start.month, d.start.day) : null;
                                        const ed = d.end?.day ? new Date(d.end.year, d.end.month, d.end.day) : null;
                                        const curr = new Date(selYear, selMonth, day);
                                        let inRange = false;
                                        if (sd && ed && curr >= sd && curr <= ed) inRange = true;

                                        const isDisabled = (target === 'start' && ed && curr > ed) || (target === 'end' && sd && curr < sd);

                                        return (
                                          <button
                                            key={day}
                                            type="button"
                                            disabled={isDisabled}
                                            onClick={() => {
                                              const txt = `${String(day).padStart(2, '0')}/${String(selMonth + 1).padStart(2, '0')}/${selYear}`;
                                              let updates = { [target]: { ...selData, day, month: selMonth, year: selYear, text: txt }, activePicker: null };
                                              if (target === 'start' && ed && curr > ed) updates.end = {};
                                              if (target === 'end' && sd && curr < sd) updates.start = {};
                                              setD(updates);
                                            }}
                                            className={`w-full aspect-square flex items-center justify-center text-sm rounded-full transition-colors
                                          ${isDisabled ? 'opacity-20 cursor-not-allowed text-gray-400' : isSelected ? 'bg-white/20 text-white font-bold' : inRange ? 'bg-white/10 text-white' : isToday ? 'ring-1 ring-white/60 text-white' : 'text-gray-300 hover:bg-white/10'}
                                        `}
                                          >
                                            {day}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          }

                          const handleInput = (e, target) => {
                            let raw = e.target.value.replace(/[^\d]/g, '');
                            if (raw.length > 8) raw = raw.slice(0, 8);

                            let dd = raw.slice(0, 2);
                            let mm = raw.slice(2, 4);
                            let yy = raw.slice(4, 8);

                            if (dd.length === 2) {
                              if (parseInt(dd, 10) > 31) dd = '31';
                              if (parseInt(dd, 10) === 0) dd = '01';
                            }
                            if (mm.length === 2) {
                              if (parseInt(mm, 10) > 12) mm = '12';
                              if (parseInt(mm, 10) === 0) mm = '01';
                            }

                            let formatted = dd;
                            if (mm.length > 0) formatted += '/' + mm;
                            if (yy.length > 0) formatted += '/' + yy;

                            raw = dd + mm + yy;

                            let targetData = { text: formatted };
                            let updates = {};

                            if (raw.length === 8) {
                              const d_val = parseInt(dd, 10);
                              const m_val = parseInt(mm, 10);
                              const y_val = parseInt(yy, 10);

                              const daysInThisMonth = new Date(y_val, m_val, 0).getDate();
                              let finalDay = d_val;
                              if (d_val > daysInThisMonth) {
                                finalDay = daysInThisMonth;
                                formatted = String(finalDay).padStart(2, '0') + '/' + mm + '/' + yy;
                              }

                              targetData = { text: formatted, day: finalDay, month: m_val - 1, year: y_val };

                              const tDate = new Date(y_val, m_val - 1, finalDay);
                              if (target === 'start' && d.end?.day) {
                                const edObj = new Date(d.end.year, d.end.month, d.end.day);
                                if (tDate > edObj) updates.end = {};
                              } else if (target === 'end' && d.start?.day) {
                                const sdObj = new Date(d.start.year, d.start.month, d.start.day);
                                if (tDate < sdObj) updates.start = {};
                              }
                            } else {
                              targetData = { text: formatted, day: null };
                            }
                            updates[target] = { ...(d[target] || {}), ...targetData };
                            setD(updates);
                          };

                          const s = d.start || {};
                          const e = d.end || {};
                          const sDate = s.day ? `${String(s.day).padStart(2, '0')}/${String(s.month + 1).padStart(2, '0')}/${s.year}` : '';
                          const eDate = e.day ? `${String(e.day).padStart(2, '0')}/${String(e.month + 1).padStart(2, '0')}/${e.year}` : '';

                          return (
                            <div>
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}</h2>
                              <div className="flex gap-2 items-center relative">
                                <div className="flex-1 relative">
                                  <input
                                    type="text"
                                    value={s.text !== undefined ? s.text : sDate}
                                    onChange={(ev) => handleInput(ev, 'start')}
                                    placeholder="DD/MM/YYYY"
                                    className={`w-full p-3 pr-10 border rounded text-sm outline-none transition-colors ${activePicker === 'start' ? 'border-gray-900 ring-1 ring-gray-900 bg-white' : 'border-gray-200 bg-gray-50 hover:border-gray-400'}`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setD({ activePicker: activePicker === 'start' ? null : 'start', pickerView: 'day', viewYear: new Date().getFullYear(), viewMonth: new Date().getMonth() })}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                                  </button>
                                </div>

                                <span className="text-gray-300 material-symbols-outlined text-[14px]">arrow_forward</span>

                                <div className="flex-1 relative">
                                  <input
                                    type="text"
                                    value={e.text !== undefined ? e.text : eDate}
                                    onChange={(ev) => handleInput(ev, 'end')}
                                    placeholder="DD/MM/YYYY"
                                    className={`w-full p-3 pr-10 border rounded text-sm outline-none transition-colors ${activePicker === 'end' ? 'border-gray-900 ring-1 ring-gray-900 bg-white' : 'border-gray-200 bg-gray-50 hover:border-gray-400'}`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setD({ activePicker: activePicker === 'end' ? null : 'end', pickerView: 'day', viewYear: new Date().getFullYear(), viewMonth: new Date().getMonth() })}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                                  </button>
                                </div>
                              </div>
                              {activePicker && renderCalendar(activePicker)}
                            </div>
                          );
                        })()}



                        {activeBlock.type === 'color_picker' && (() => {
                          const val = previewData[activeBlock.id] || '#000000';
                          const isValidHex = /^#[0-9A-F]{6}$/i.test(val);
                          const pickerColor = isValidHex ? val : '#000000';

                          return (
                            <div>
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}</h2>
                              <div className="flex items-center gap-3 p-2 border border-gray-200 rounded bg-white w-48 focus-within:border-gray-900 transition-colors">
                                <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 relative">
                                  <input 
                                    type="color"
                                    value={pickerColor}
                                    onChange={(e) => updatePreviewData(activeBlock.id, e.target.value)}
                                    className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-0 p-0"
                                  />
                                </div>
                                <input
                                  type="text"
                                  value={val}
                                  onChange={(e) => updatePreviewData(activeBlock.id, e.target.value)}
                                  onBlur={(e) => {
                                    let v = e.target.value;
                                    if (v && !v.startsWith('#')) v = '#' + v;
                                    if (/^#[0-9A-F]{3}$/i.test(v)) {
                                      v = '#' + v[1]+v[1] + v[2]+v[2] + v[3]+v[3];
                                    }
                                    if (!/^#[0-9A-F]{6}$/i.test(v)) v = '#000000';
                                    updatePreviewData(activeBlock.id, v.toUpperCase());
                                  }}
                                  className="text-sm text-gray-700 font-mono uppercase border-none focus:ring-0 p-0 w-full bg-transparent outline-none flex-1"
                                  placeholder="#HEXCODE"
                                  maxLength={7}
                                />
                              </div>
                            </div>
                          );
                        })()}

                        {activeBlock.type === 'tags' && (() => {
                          const val = previewData[activeBlock.id] || [];
                          return (
                            <div>
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}</h2>
                              <div className="p-2 border border-gray-200 rounded bg-white flex gap-2 flex-wrap min-h-[42px] items-center cursor-text">
                                {val.map((tag, i) => (
                                  <span key={i} className="px-2 py-1 bg-gray-100 text-xs rounded-full flex items-center gap-1">
                                    {tag} 
                                    <span 
                                      className="material-symbols-outlined text-[12px] cursor-pointer hover:text-red-500"
                                      onClick={() => updatePreviewData(activeBlock.id, val.filter((_, idx) => idx !== i))}
                                    >
                                      close
                                    </span>
                                  </span>
                                ))}
                                <input 
                                  type="text" 
                                  placeholder={val.length === 0 ? "Add tags..." : ""}
                                  className="bg-transparent outline-none text-sm min-w-[80px] flex-1" 
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.target.value.trim()) {
                                      e.preventDefault();
                                      const newTag = e.target.value.trim();
                                      if (!val.includes(newTag)) {
                                        updatePreviewData(activeBlock.id, [...val, newTag]);
                                      }
                                      e.target.value = '';
                                    } else if (e.key === 'Backspace' && e.target.value === '' && val.length > 0) {
                                      updatePreviewData(activeBlock.id, val.slice(0, -1));
                                    }
                                  }}
                                />
                              </div>
                              <p className="text-[10px] text-gray-400 mt-1">Press Enter to add a tag</p>
                            </div>
                          );
                        })()}

                        {activeBlock.type === 'credit_card' && (() => {
                          const val = previewData[activeBlock.id] || { number: '', expiry: '', cvc: '' };
                          
                          const formatCardNumber = (num) => {
                            const cleaned = ('' + num).replace(/\D/g, '');
                            const match = cleaned.match(/.{1,4}/g);
                            return match ? match.join(' ') : cleaned;
                          };
                          
                          const formatExpiry = (exp) => {
                            let cleaned = ('' + exp).replace(/\D/g, '');
                            if (cleaned.length > 0) {
                              if (parseInt(cleaned[0]) > 1) cleaned = '0' + cleaned;
                              if (cleaned.length >= 2) {
                                let mm = parseInt(cleaned.substring(0, 2));
                                if (mm > 12) cleaned = '12' + cleaned.substring(2);
                                if (mm === 0 && cleaned.length >= 2) cleaned = '01' + cleaned.substring(2);
                                cleaned = cleaned.substring(0, 2) + (cleaned.length > 2 ? '/' + cleaned.substring(2, 4) : '');
                              }
                            }
                            return cleaned;
                          };

                          return (
                            <div>
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}</h2>
                              <div className="border border-gray-200 rounded overflow-hidden bg-white focus-within:border-gray-900 transition-colors">
                                <div className="p-3 border-b border-gray-200 flex justify-between items-center relative">
                                  <input 
                                    type="text"
                                    value={val.number || ''}
                                    onChange={(e) => {
                                      const cleaned = e.target.value.replace(/\D/g, '');
                                      if (cleaned.length <= 16) {
                                        updatePreviewData(activeBlock.id, { ...val, number: formatCardNumber(cleaned) });
                                      }
                                    }}
                                    placeholder="Card Number"
                                    className="w-full text-sm outline-none bg-transparent"
                                  />
                                  <span className="material-symbols-outlined text-gray-300 absolute right-3 pointer-events-none">credit_card</span>
                                </div>
                                <div className="flex bg-white">
                                  <div className="border-r border-gray-200 flex-1 relative">
                                    <input 
                                      type="text"
                                      value={val.expiry || ''}
                                      onChange={(e) => {
                                        const newVal = e.target.value;
                                        if (val.expiry?.endsWith('/') && newVal.length === val.expiry.length - 1) {
                                          updatePreviewData(activeBlock.id, { ...val, expiry: newVal.slice(0, -1) });
                                        } else {
                                          updatePreviewData(activeBlock.id, { ...val, expiry: formatExpiry(newVal) });
                                        }
                                      }}
                                      placeholder="MM/YY"
                                      className="w-full p-3 text-sm outline-none bg-transparent"
                                      maxLength={5}
                                    />
                                  </div>
                                  <div className="flex-1 relative">
                                    <input 
                                      type="text"
                                      value={val.cvc || ''}
                                      onChange={(e) => {
                                        const cleaned = e.target.value.replace(/\D/g, '');
                                        if (cleaned.length <= 4) {
                                          updatePreviewData(activeBlock.id, { ...val, cvc: cleaned });
                                        }
                                      }}
                                      placeholder="CVC"
                                      className="w-full p-3 text-sm outline-none bg-transparent"
                                      maxLength={4}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {activeBlock.type === 'matrix' && (() => {
                          const val = previewData[activeBlock.id] || {};
                          const setVal = (row, col) => updatePreviewData(activeBlock.id, { ...val, [row]: col });
                          const renderRows = activeBlock.rows || ['Quality', 'Speed'];
                          const renderCols = activeBlock.columns || ['Poor', 'Avg', 'Good'];

                          return (
                            <div>
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}</h2>
                              <div className="border border-gray-200 rounded bg-white overflow-x-auto text-xs">
                                <div className="min-w-max">
                                  <div className="flex bg-gray-50 border-b border-gray-200 p-2 font-bold text-gray-500">
                                    <div className="w-32 flex-shrink-0"></div>
                                    {renderCols.map(col => (
                                      <div key={col} className="w-24 flex-shrink-0 text-center px-1 break-words">{col}</div>
                                    ))}
                                  </div>
                                  {renderRows.map((row, i) => (
                                    <div key={i} className="flex p-2 border-b border-gray-100 last:border-0 items-center">
                                      <div className="w-32 flex-shrink-0 font-semibold text-gray-700 pr-2 break-words">{row}</div>
                                      {renderCols.map(col => {
                                        const isSelected = val[row] === col;
                                        return (
                                          <div key={col} className="w-24 flex-shrink-0 flex justify-center">
                                            <button 
                                              type="button"
                                              onClick={() => setVal(row, col)}
                                              className={`w-4 h-4 rounded-full border transition-colors flex items-center justify-center ${isSelected ? 'border-gray-900 bg-gray-900' : 'border-gray-300 bg-white hover:border-gray-400'}`}
                                            >
                                              {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                            </button>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {activeBlock.type === 'counter' && (() => {
                          const val = previewData[activeBlock.id] || 0;
                          return (
                            <div>
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}</h2>
                              <div className="flex items-center justify-between p-2 border border-gray-200 rounded bg-white w-32">
                                <button type="button" onClick={() => updatePreviewData(activeBlock.id, val > 0 ? val - 1 : 0)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded text-gray-500 hover:bg-gray-200 transition-colors">-</button>
                                <span className="font-bold">{val}</span>
                                <button type="button" onClick={() => updatePreviewData(activeBlock.id, val + 1)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded text-gray-500 hover:bg-gray-200 transition-colors">+</button>
                              </div>
                            </div>
                          );
                        })()}

                        {activeBlock.type === 'slider' && (() => {
                          const min = activeBlock.min || 0;
                          const max = activeBlock.max || 100;
                          const val = previewData[activeBlock.id] !== undefined ? previewData[activeBlock.id] : ((max + min) / 2);
                          const percentage = ((val - min) / (max - min)) * 100;
                          
                          return (
                            <div>
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}</h2>
                              <div className="pt-8 pb-4 relative">
                                <div 
                                  className="absolute top-1 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded flex items-center justify-center min-w-[24px]"
                                  style={{ left: `calc(${percentage}% + ${8 - (percentage * 0.16)}px)` }}
                                >
                                  {val}
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-gray-900"></div>
                                </div>
                                <input 
                                  type="range" 
                                  min={min} 
                                  max={max} 
                                  value={val}
                                  onChange={(e) => updatePreviewData(activeBlock.id, parseInt(e.target.value, 10))}
                                  className="w-full h-1 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-gray-900 [&::-webkit-slider-thumb]:rounded-full [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-gray-900 [&::-moz-range-thumb]:rounded-full"
                                  style={{
                                    background: `linear-gradient(to right, #111827 0%, #111827 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
                                  }}
                                />
                                <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                  <span>{activeBlock.minLabel || 'Min'}</span>
                                  <span>{activeBlock.maxLabel || 'Max'}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {activeBlock.type === 'spacer' && (
                          <div className="py-6">
                            <div className="w-full h-8 bg-gray-50 border border-gray-100 border-dashed flex items-center justify-center text-gray-300 text-[10px] uppercase font-bold tracking-widest rounded">
                              Spacer
                            </div>
                          </div>
                        )}

                        {activeBlock.type === 'fullname' && (
                          <div>
                            <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}</h2>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="First Name"
                                value={previewData[activeBlock.id]?.first || ''}
                                onChange={(e) => updatePreviewData(activeBlock.id, { ...previewData[activeBlock.id], first: e.target.value })}
                                className="w-1/2 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900 transition-colors"
                              />
                              <input
                                type="text"
                                placeholder="Last Name"
                                value={previewData[activeBlock.id]?.last || ''}
                                onChange={(e) => updatePreviewData(activeBlock.id, { ...previewData[activeBlock.id], last: e.target.value })}
                                className="w-1/2 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900 transition-colors"
                              />
                            </div>
                          </div>
                        )}

                        {activeBlock.type === 'address' && (
                          <div>
                            <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}</h2>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Street Address"
                                value={previewData[activeBlock.id]?.street || ''}
                                onChange={(e) => updatePreviewData(activeBlock.id, { ...previewData[activeBlock.id], street: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900 transition-colors"
                              />
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="City"
                                  value={previewData[activeBlock.id]?.city || ''}
                                  onChange={(e) => updatePreviewData(activeBlock.id, { ...previewData[activeBlock.id], city: e.target.value })}
                                  className="w-1/2 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900 transition-colors"
                                />
                                <input
                                  type="text"
                                  placeholder="State"
                                  value={previewData[activeBlock.id]?.state || ''}
                                  onChange={(e) => updatePreviewData(activeBlock.id, { ...previewData[activeBlock.id], state: e.target.value })}
                                  className="w-1/2 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900 transition-colors"
                                />
                              </div>
                              <input
                                type="text"
                                placeholder="ZIP / Postal Code"
                                value={previewData[activeBlock.id]?.zip || ''}
                                onChange={(e) => updatePreviewData(activeBlock.id, { ...previewData[activeBlock.id], zip: e.target.value.replace(/\D/g, '') })}
                                className="w-1/2 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900 transition-colors"
                              />
                            </div>
                          </div>
                        )}

                        {activeBlock.type === 'time' && (() => {
                          const val = previewData[activeBlock.id] || { hh: '', mm: '', period: 'AM' };

                          const formatHH = (str) => {
                            let cleaned = str.replace(/\D/g, '');
                            if (cleaned.length > 0) {
                              if (parseInt(cleaned[0]) > 1) cleaned = '0' + cleaned;
                              if (cleaned.length >= 2) {
                                let hh = parseInt(cleaned.substring(0, 2));
                                if (hh > 12) cleaned = '12';
                                if (hh === 0 && cleaned.length >= 2) cleaned = '01';
                              }
                            }
                            return cleaned;
                          };

                          const formatMM = (str) => {
                            let cleaned = str.replace(/\D/g, '');
                            if (cleaned.length > 0) {
                              if (parseInt(cleaned[0]) > 5) cleaned = '0' + cleaned;
                              if (cleaned.length >= 2) {
                                let mm = parseInt(cleaned.substring(0, 2));
                                if (mm > 59) cleaned = '59';
                              }
                            }
                            return cleaned;
                          };

                          return (
                            <div>
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}</h2>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-3 py-2 focus-within:border-gray-900 transition-colors">
                                  <input 
                                    type="text" 
                                    placeholder="--" 
                                    value={val.hh}
                                    onChange={(e) => updatePreviewData(activeBlock.id, { ...val, hh: formatHH(e.target.value) })}
                                    className="w-6 text-center text-sm font-medium bg-transparent outline-none"
                                    maxLength={2}
                                  />
                                  <span className="text-gray-400 font-bold">:</span>
                                  <input 
                                    type="text" 
                                    placeholder="--" 
                                    value={val.mm}
                                    onChange={(e) => updatePreviewData(activeBlock.id, { ...val, mm: formatMM(e.target.value) })}
                                    className="w-6 text-center text-sm font-medium bg-transparent outline-none"
                                    maxLength={2}
                                  />
                                </div>
                                <div className="flex bg-gray-50 border border-gray-200 rounded overflow-hidden">
                                  <button 
                                    type="button"
                                    onClick={() => updatePreviewData(activeBlock.id, { ...val, period: 'AM' })}
                                    className={`px-3 py-2 text-xs font-bold transition-colors ${val.period === 'AM' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-200'}`}
                                  >
                                    AM
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => updatePreviewData(activeBlock.id, { ...val, period: 'PM' })}
                                    className={`px-3 py-2 text-xs font-bold transition-colors ${val.period === 'PM' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-200'}`}
                                  >
                                    PM
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {activeBlock.type === 'date' && (() => {
                          const dateVal = previewData[activeBlock.id];
                          const d = dateVal || {};
                          const pickerOpen = d.pickerOpen || false;
                          const pickerView = d.pickerView || 'day';
                          const viewYear = d.viewYear || new Date().getFullYear();
                          const viewMonth = d.viewMonth !== undefined ? d.viewMonth : new Date().getMonth();
                          const selDay = d.day || null;
                          const selMonth = d.month;
                          const selYear = d.year;
                          const setD = (patch) => updatePreviewData(activeBlock.id, { ...d, ...patch });

                          const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
                          const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
                          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                          const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                          const yearStart = Math.floor(viewYear / 16) * 16;

                          const formattedDate = selDay ? `${String(selDay).padStart(2, '0')}/${String(selMonth + 1).padStart(2, '0')}/${selYear}` : '';

                          return (
                            <div>
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}</h2>
                              {/* Text input + calendar icon */}
                              <div className="relative">
                                <input
                                  type="text"
                                  value={d.text !== undefined ? d.text : formattedDate}
                                  onChange={(e) => {
                                    let raw = e.target.value.replace(/[^\d]/g, '');
                                    if (raw.length > 8) raw = raw.slice(0, 8);

                                    let dd = raw.slice(0, 2);
                                    let mm = raw.slice(2, 4);
                                    let yy = raw.slice(4, 8);

                                    if (dd.length === 2) {
                                      if (parseInt(dd, 10) > 31) dd = '31';
                                      if (parseInt(dd, 10) === 0) dd = '01';
                                    }
                                    if (mm.length === 2) {
                                      if (parseInt(mm, 10) > 12) mm = '12';
                                      if (parseInt(mm, 10) === 0) mm = '01';
                                    }

                                    let formatted = dd;
                                    if (mm.length > 0) formatted += '/' + mm;
                                    if (yy.length > 0) formatted += '/' + yy;

                                    raw = dd + mm + yy;

                                    // Auto-parse DD/MM/YYYY
                                    if (raw.length === 8) {
                                      const d_val = parseInt(dd, 10);
                                      const m_val = parseInt(mm, 10);
                                      const y_val = parseInt(yy, 10);

                                      // check true days in month
                                      const daysInThisMonth = new Date(y_val, m_val, 0).getDate();
                                      let finalDay = d_val;
                                      if (d_val > daysInThisMonth) {
                                        finalDay = daysInThisMonth;
                                        formatted = String(finalDay).padStart(2, '0') + '/' + mm + '/' + yy;
                                      }

                                      setD({ text: formatted, day: finalDay, month: m_val - 1, year: y_val });
                                    } else {
                                      setD({ text: formatted, day: null });
                                    }
                                  }}
                                  placeholder="DD/MM/YYYY"
                                  className="w-full p-3 pr-10 border border-gray-200 rounded text-sm text-gray-900 bg-gray-50 outline-none focus:border-gray-900 transition-colors"
                                />
                                <button
                                  type="button"
                                  onClick={() => setD({ pickerOpen: !pickerOpen, pickerView: 'day', viewYear: new Date().getFullYear(), viewMonth: new Date().getMonth() })}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                                </button>
                              </div>

                              {/* Calendar popup */}
                              {pickerOpen && (
                                <div className="mt-2 rounded-lg overflow-hidden shadow-xl" style={{ backgroundColor: '#282828', color: '#e0e0e0', width: '100%' }}>
                                  {/* Header */}
                                  <div className="flex items-center justify-between px-4 py-3">
                                    <button
                                      type="button"
                                      onClick={() => setD({ pickerView: pickerView === 'day' ? 'year' : (pickerView === 'month' ? 'year' : 'day') })}
                                      className="text-white text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-opacity"
                                    >
                                      {pickerView === 'year' ? `${yearStart} – ${yearStart + 15}` : pickerView === 'month' ? viewYear : `${monthNames[viewMonth]} ${viewYear}`}
                                      <span className="material-symbols-outlined text-[16px]">{pickerView === 'day' ? 'arrow_drop_down' : 'arrow_drop_up'}</span>
                                    </button>
                                    {pickerView === 'day' && (
                                      <div className="flex gap-1">
                                        <button type="button" onClick={() => setD({ viewMonth: viewMonth === 0 ? 11 : viewMonth - 1, viewYear: viewMonth === 0 ? viewYear - 1 : viewYear })} className="w-7 h-7 flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors">
                                          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                        </button>
                                        <button type="button" onClick={() => setD({ viewMonth: viewMonth === 11 ? 0 : viewMonth + 1, viewYear: viewMonth === 11 ? viewYear + 1 : viewYear })} className="w-7 h-7 flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors">
                                          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                        </button>
                                      </div>
                                    )}
                                    {pickerView === 'year' && (
                                      <div className="flex gap-1">
                                        <button type="button" onClick={() => setD({ viewYear: viewYear - 16 })} className="w-7 h-7 flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors">
                                          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                        </button>
                                        <button type="button" onClick={() => setD({ viewYear: viewYear + 16 })} className="w-7 h-7 flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors">
                                          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {/* Year Grid */}
                                  {pickerView === 'year' && (
                                    <div className="grid grid-cols-4 gap-1 px-3 pb-4">
                                      {Array.from({ length: 16 }, (_, i) => yearStart + i).map(yr => (
                                        <button
                                          key={yr}
                                          type="button"
                                          onClick={() => setD({ viewYear: yr, pickerView: 'month' })}
                                          className={`py-2 rounded-full text-sm transition-colors ${yr === viewYear ? 'bg-white/20 text-white font-bold' : 'text-gray-300 hover:bg-white/10'}`}
                                        >
                                          {yr}
                                        </button>
                                      ))}
                                    </div>
                                  )}

                                  {/* Month Grid */}
                                  {pickerView === 'month' && (
                                    <div className="grid grid-cols-3 gap-1 px-3 pb-4">
                                      {monthNames.map((m, i) => (
                                        <button
                                          key={m}
                                          type="button"
                                          onClick={() => setD({ viewMonth: i, pickerView: 'day' })}
                                          className={`py-3 rounded-full text-sm transition-colors ${i === viewMonth ? 'bg-white/20 text-white font-bold' : 'text-gray-300 hover:bg-white/10'}`}
                                        >
                                          {m.slice(0, 3)}
                                        </button>
                                      ))}
                                    </div>
                                  )}

                                  {/* Day Grid */}
                                  {pickerView === 'day' && (
                                    <div className="px-3 pb-4">
                                      <div className="grid grid-cols-7 mb-1">
                                        {dayLabels.map((label, i) => (
                                          <div key={i} className="text-center text-[11px] font-medium py-1" style={{ color: '#9aa0a6' }}>{label}</div>
                                        ))}
                                      </div>
                                      <div className="grid grid-cols-7">
                                        {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
                                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                                          const isToday = day === new Date().getDate() && viewMonth === new Date().getMonth() && viewYear === new Date().getFullYear();
                                          const isSelected = day === selDay && viewMonth === selMonth && viewYear === selYear;
                                          return (
                                            <button
                                              key={day}
                                              type="button"
                                              onClick={() => {
                                                const txt = `${String(day).padStart(2, '0')}/${String(viewMonth + 1).padStart(2, '0')}/${viewYear}`;
                                                setD({ day, month: viewMonth, year: viewYear, text: txt, pickerOpen: false });
                                              }}
                                              className={`w-full aspect-square flex items-center justify-center text-sm rounded-full transition-colors
                                          ${isSelected ? 'bg-white/20 text-white font-bold' : isToday ? 'ring-1 ring-white/60 text-white' : 'text-gray-300 hover:bg-white/10'}
                                        `}
                                            >
                                              {day}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {activeBlock.type === 'rating_stars' && (() => {
                          const val = previewData[activeBlock.id] || 0;
                          return (
                            <div>
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}</h2>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => updatePreviewData(activeBlock.id, star)}
                                    className="outline-none"
                                  >
                                    <span className={`material-symbols-outlined text-[32px] transition-colors ${star <= val ? 'text-yellow-400' : 'text-gray-300'}`}>
                                      star_rate
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        {activeBlock.type === 'emoji_rating' && (() => {
                          const val = previewData[activeBlock.id];
                          const emojis = [
                            { emoji: '😢', value: 1 },
                            { emoji: '😐', value: 2 },
                            { emoji: '😀', value: 3 }
                          ];
                          return (
                            <div>
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}</h2>
                              <div className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded p-4">
                                {emojis.map(({ emoji, value }) => (
                                  <button
                                    key={value}
                                    type="button"
                                    onClick={() => updatePreviewData(activeBlock.id, value)}
                                    className={`text-[32px] transition-all cursor-pointer outline-none ${val === value ? 'grayscale-0 opacity-100 scale-110' : 'grayscale opacity-40 hover:grayscale-0 hover:opacity-100'}`}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        {activeBlock.type === 'linear_scale' && (() => {
                          const val = previewData[activeBlock.id];
                          return (
                            <div>
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">
                                {activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}
                              </h2>
                              <div className="flex justify-between items-center bg-gray-50 p-4 border border-gray-200 rounded">
                                {[1, 2, 3, 4, 5].map(num => (
                                  <button
                                    key={num}
                                    type="button"
                                    onClick={() => updatePreviewData(activeBlock.id, num)}
                                    className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-bold transition-colors outline-none ${val === num ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'}`}
                                  >
                                    {num}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        {activeBlock.type === 'nps' && (() => {
                          const val = previewData[activeBlock.id];
                          return (
                            <div>
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">
                                {activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}
                              </h2>
                              <div className="flex justify-between items-center bg-gray-50 p-2 border border-gray-200 rounded">
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                  <button 
                                    key={num} 
                                    type="button"
                                    onClick={() => updatePreviewData(activeBlock.id, num)}
                                    className={`w-6 h-8 rounded border flex items-center justify-center text-[10px] font-bold transition-colors ${val === num ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'}`}
                                  >
                                    {num}
                                  </button>
                                ))}
                              </div>
                              <div className="flex justify-between mt-2 text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                                <span>Not likely</span>
                                <span>Very likely</span>
                              </div>
                            </div>
                          );
                        })()}

                        {activeBlock.type === 'yes_no' && (() => {
                          const val = previewData[activeBlock.id];
                          return (
                            <div>
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">
                                {activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}
                              </h2>
                              <div className="flex gap-4">
                                <button 
                                  type="button" 
                                  onClick={() => updatePreviewData(activeBlock.id, 'yes')}
                                  className={`flex-1 border rounded py-3 text-center text-sm font-bold transition-colors ${val === 'yes' ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
                                >
                                  Yes
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => updatePreviewData(activeBlock.id, 'no')}
                                  className={`flex-1 border rounded py-3 text-center text-sm font-bold transition-colors ${val === 'no' ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          );
                        })()}

                        {activeBlock.type === 'terms' && (() => {
                          const isChecked = previewData[activeBlock.id] || false;
                          return (
                            <div>
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">
                                {activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}
                              </h2>
                              <div 
                                className="flex items-start gap-3 p-4 border border-gray-200 rounded bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => updatePreviewData(activeBlock.id, !isChecked)}
                              >
                                <span className={`w-4 h-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${isChecked ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-300'}`}>
                                  {isChecked && <span className="material-symbols-outlined text-[12px] font-bold">check</span>}
                                </span>
                                <span className="text-xs text-gray-600 leading-relaxed select-none">{activeBlock.options?.[0]?.label || 'I agree to the terms'}</span>
                              </div>
                            </div>
                          );
                        })()}

                        {activeBlock.type === 'heading' && (
                          <div className="pt-4 pb-2 border-b-2 border-gray-900">
                            <h1 className="text-2xl font-bold text-gray-900">{activeBlock.title}</h1>
                          </div>
                        )}

                        {activeBlock.type === 'divider' && (
                          <div className="py-4">
                            <div className="w-full border-t border-gray-300 border-dashed"></div>
                          </div>
                        )}

                        {activeBlock.type === 'signature' && (
                          <div>
                            <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">
                              {activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}
                            </h2>
                            <SignaturePad onChange={(dataUrl) => updatePreviewData(activeBlock.id, dataUrl)} />
                          </div>
                        )}


                        {activeBlock.type === 'choice' && (() => {
                          const val = previewData[activeBlock.id];
                          return (
                            <div>
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">
                                {activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}
                              </h2>
                              <div className="space-y-2">
                                {activeBlock.options?.map((opt, i) => {
                                  const isSelected = val === opt.value;
                                  return (
                                    <div 
                                      key={i} 
                                      onClick={() => updatePreviewData(activeBlock.id, opt.value)}
                                      className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors ${isSelected ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-400'}`}
                                    >
                                      <span className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? 'border-gray-900' : 'border-gray-300'}`}>
                                        {isSelected && <span className="w-2 h-2 rounded-full bg-gray-900"></span>}
                                      </span>
                                      <span className={`text-sm ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>{opt.label}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}

                        {activeBlock.type === 'dropdown' && (() => {
                          const val = previewData[activeBlock.id];
                          const selectedOpt = activeBlock.options?.find(o => o.value === val);
                          const selectOptions = activeBlock.options?.map(opt => ({ value: opt.value, label: opt.label })) || [];
                          return (
                            <div>
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">
                                {activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}
                              </h2>
                              <Select
                                value={selectedOpt ? { value: selectedOpt.value, label: selectedOpt.label } : null}
                                onChange={(selectedOption) => updatePreviewData(activeBlock.id, selectedOption.value)}
                                options={selectOptions}
                                placeholder="Select an option..."
                                styles={{
                                  control: (baseStyles, state) => ({
                                    ...baseStyles,
                                    backgroundColor: '#f9fafb',
                                    borderColor: state.isFocused ? '#111827' : '#e5e7eb',
                                    boxShadow: state.isFocused ? '0 0 0 1px #111827' : 'none',
                                    padding: '2px',
                                    borderRadius: '0.375rem',
                                    '&:hover': {
                                      borderColor: '#111827'
                                    }
                                  })
                                }}
                              />
                            </div>
                          );
                        })()}

                        {activeBlock.type === 'otp' && (() => {
                          const val = previewData[activeBlock.id] || '';
                          return (
                            <div>
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">
                                {activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}
                              </h2>
                              <div className="flex gap-2 justify-between">
                                {[0, 1, 2, 3, 4, 5].map((idx) => (
                                  <input
                                    key={idx}
                                    type="text"
                                    maxLength="1"
                                    value={val[idx] || ''}
                                    onChange={(e) => {
                                      const char = e.target.value.replace(/\D/g, ''); // numbers only
                                      if (char || e.target.value === '') {
                                        let newVal = val.split('');
                                        newVal[idx] = char;
                                        updatePreviewData(activeBlock.id, newVal.join(''));
                                        
                                        // auto focus next
                                        if (char && idx < 5) {
                                          const nextInput = e.target.nextElementSibling;
                                          if (nextInput) nextInput.focus();
                                        }
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Backspace' && !val[idx] && idx > 0) {
                                        const prevInput = e.target.previousElementSibling;
                                        if (prevInput) prevInput.focus();
                                      }
                                    }}
                                    className="w-10 h-12 text-center text-lg font-bold bg-gray-50 border border-gray-200 rounded focus:border-gray-900 focus:ring-0 outline-none transition-colors"
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        {activeBlock.type === 'sentiment' && (
                          <div>
                            <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">
                              {activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}
                            </h2>
                            <textarea
                              disabled
                              placeholder="Write something..."
                              className="w-full bg-gray-50 border border-gray-200 rounded p-3 text-sm text-gray-700 h-20 resize-none mb-3"
                            />
                            <div className="p-3 bg-gray-50 border border-gray-200 flex items-center justify-between text-xs text-gray-500">
                              <span>AI Sentiment Evaluation</span>
                              <span className="bg-primary/20 text-primary-container px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[9px]">Awaiting input</span>
                            </div>
                          </div>
                        )}

                        {(activeBlock.type === 'upload' || activeBlock.type === 'fileupload') && (() => {
                          const file = previewData[activeBlock.id];
                          return (
                            <div>
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">
                                {activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}
                              </h2>
                              <label className="block w-full cursor-pointer">
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  onChange={(e) => {
                                    if(e.target.files && e.target.files[0]) {
                                      updatePreviewData(activeBlock.id, { name: e.target.files[0].name });
                                    }
                                  }}
                                />
                                <div className={`border-2 border-dashed rounded p-6 flex flex-col items-center justify-center transition-colors ${file ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300'} text-gray-400`}>
                                  <span className={`material-symbols-outlined text-[32px] mb-1 ${file ? 'text-gray-900' : 'text-gray-300'}`}>
                                    {file ? 'draft' : 'cloud_upload'}
                                  </span>
                                  <span className={`text-[10px] ${file ? 'text-gray-900 font-bold' : ''}`}>
                                    {file ? file.name : 'Tap to upload files'}
                                  </span>
                                </div>
                              </label>
                            </div>
                          );
                        })()}

                      </div>
                    );
                  })}
                </div>

                {/* Navigation inside phone mockup */}
                <div className="mt-8 pt-4 flex justify-between items-center border-t border-gray-100">
                  {formMode === 'conversational' ? (
                    (() => {
                      const currentIndex = blocks.findIndex(b => b.id === activeBlockId);
                      const isFirstBlock = currentIndex === 0;
                      // Prevent returning to welcome screen if they already passed it
                      const isFirstQuestionAfterWelcome = currentIndex === 1 && blocks[0].type === 'welcome';
                      const disableUp = isFirstBlock || isFirstQuestionAfterWelcome;
                      const isLast = currentIndex === blocks.length - 1;

                      return (
                        <div className="flex gap-2 w-full">
                          <button
                            disabled={disableUp}
                            onClick={() => !disableUp && setActiveBlockId(blocks[currentIndex - 1].id)}
                            className={`w-8 h-8 border border-gray-200 flex items-center justify-center rounded-sm transition-colors ${disableUp ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                          >
                            <span className="material-symbols-outlined text-[18px]">keyboard_arrow_up</span>
                          </button>
                          <button
                            disabled={isLast}
                            onClick={() => !isLast && setActiveBlockId(blocks[currentIndex + 1].id)}
                            className={`w-8 h-8 border border-gray-200 flex items-center justify-center rounded-sm transition-colors ${isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                          >
                            <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                          </button>
                          {isLast && (
                            <button onClick={handleSubmit} disabled={submitting} className="flex-1 ml-4 h-8 bg-gray-900 text-white flex items-center justify-center font-bold text-xs tracking-wider uppercase rounded-sm hover:bg-black">
                              {submitting ? 'Submitting...' : 'Submit'}
                            </button>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="flex gap-2 w-full">
                      {currentPage > 1 && (
                        <button 
                          onClick={() => setCurrentPage(prev => prev - 1)}
                          className="flex-1 h-10 bg-white text-gray-900 border border-gray-200 flex items-center justify-center font-bold text-xs tracking-wider uppercase rounded-sm hover:bg-gray-50 transition-colors"
                        >
                          Previous
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          const newPreviewData = { ...previewData };
                          visibleBlocks.forEach(b => delete newPreviewData[b.id]);
                          setPreviewData(newPreviewData);
                        }}
                        className="flex-1 h-10 bg-white text-red-500 border border-gray-200 flex items-center justify-center font-bold text-xs tracking-wider uppercase rounded-sm hover:bg-red-50 transition-colors"
                        title="Clear Page Inputs"
                      >
                        Clear
                      </button>
                      <button 
                        onClick={() => {
                          if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
                          else handleSubmit();
                        }}
                        disabled={submitting}
                        className="flex-1 h-10 bg-gray-900 text-white flex items-center justify-center font-bold text-xs tracking-wider uppercase rounded-sm hover:bg-black transition-colors"
                      >
                        {currentPage < totalPages ? 'Next' : (submitting ? 'Submitting...' : 'Submit')}
                      </button>
                    </div>
                  )}
                </div>
                </div>
              </div>
            </div>
    </div>
  );
};

export default PublishedForm;
