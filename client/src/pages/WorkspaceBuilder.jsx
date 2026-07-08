import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import ISO6391 from 'iso-639-1';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

countries.registerLocale(enLocale);

const SortableBlock = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="w-full relative">
      {typeof children === 'function' ? children({ listeners, attributes }) : children}
    </div>
  );
};

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

export default function WorkspaceBuilder() {
  const navigate = useNavigate();

  // State for form blocks
  const [formTitle, setFormTitle] = useState('Customer Feedback Survey 2024');
  const [activeBlockId, setActiveBlockId] = useState('rating-1');
  const [formMode, setFormMode] = useState('conversational'); // 'conversational' or 'classic'
  const [previewDevice, setPreviewDevice] = useState('mobile'); // 'mobile' or 'desktop'
  const [isLibraryVisible, setIsLibraryVisible] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [previewData, setPreviewData] = useState({});
  const updatePreviewData = (id, val) => setPreviewData(prev => ({ ...prev, [id]: val }));
  const [blocks, setBlocks] = useState([
    {
      id: 'welcome',
      type: 'welcome',
      icon: 'waving_hand',
      typeName: 'Welcome Screen',
      title: 'Welcome to our annual survey!',
      description: 'We value your feedback to help us improve our services.',
      buttonText: 'Start Survey',
      required: false,
    },
    {
      id: 'rating-1',
      type: 'rating',
      icon: 'star',
      typeName: 'Rating Scale',
      title: 'How satisfied are you with the NxtForm platform?',
      required: true,
      options: [
        { value: '1', label: 'Poor' },
        { value: '2', label: '' },
        { value: '3', label: '' },
        { value: '4', label: '' },
        { value: '5', label: 'Excellent' }
      ],
      aiLogic: 'If score is < 3, route to "Detailed Feedback". Otherwise, jump to "End Screen".',
    }
  ]);

  // Sidebar item list helper
  const addBlock = (type, typeName, icon) => {
    const newId = `${type}-${Date.now()}`;
    let newBlock = {
      id: newId,
      type,
      typeName,
      icon,
      title: `New ${typeName} question`,
      required: false,
    };

    // Nice natural titles for templates
    const naturalTitles = {
      email: 'Email Address',
      phone: 'Phone Number',
      fullname: 'Full Name',
      address: 'Home Address',
      date: 'Select a Date',
      number: 'Enter a Number',
      url: 'Website URL',
      password: 'Create a password',
      rating_stars: 'Rate your experience',
      emoji_rating: 'How are you feeling?',
      linear_scale: 'How likely are you to recommend us?',
      nps: 'How likely are you to recommend us to a friend?',
      yes_no: 'Do you agree?',
      signature: 'Please sign below',
      fileupload: 'Upload a file',
      upload: 'Upload your verification document',
      terms: 'Terms & Conditions',
      heading: 'Section Heading',
      divider: 'Divider',
      sentiment: 'Please provide detailed comments.',
      checkbox: 'Select all that apply',
      country: 'Select your country',
      language: 'Select your language',
      company: 'Company Name',
      time: 'Select a Time',
      date_range: 'Select a Date Range',
      otp: 'Enter OTP Verification Code',
      color_picker: 'Pick a Color',
      tags: 'Add Tags',
      credit_card: 'Payment Details',
      matrix: 'Please evaluate the following',
      counter: 'How many?',
      slider: 'Select a value',
      spacer: 'Spacer'
    };

    if (naturalTitles[type]) {
      newBlock.title = naturalTitles[type];
    }

    if (type === 'choice' || type === 'dropdown') {
      newBlock.options = [
        { value: '1', label: 'Option 1' },
        { value: '2', label: 'Option 2' },
        { value: '3', label: 'Option 3' }
      ];
    } else if (type === 'sentiment' || type === 'upload') {
      newBlock.description = type === 'sentiment' ? 'AI Sentiment Analyzer will flag emotional context.' : 'Smart Upload will extract metadata automatically.';
      newBlock.required = true;
    } else if (['text', 'longtext', 'email', 'number', 'phone', 'url', 'password', 'company'].includes(type)) {
      newBlock.placeholder = `Enter ${typeName.toLowerCase()}...`;
    }

    if (type === 'terms') {
      newBlock.options = [{ label: 'I agree to the Terms & Conditions and Privacy Policy' }];
    }

    setBlocks([...blocks, newBlock]);
    setActiveBlockId(newId);
  };

  const updateBlockValue = (id, field, value) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const deleteBlock = (id) => {
    const newBlocks = blocks.filter(b => b.id !== id);
    setBlocks(newBlocks);
    if (activeBlockId === id && newBlocks.length > 0) {
      setActiveBlockId(newBlocks[newBlocks.length - 1].id);
    }
  };

  const duplicateBlock = (block) => {
    const newId = `${block.type}-${Date.now()}`;
    const duplicated = {
      ...block,
      id: newId,
      title: `${block.title} (Copy)`
    };
    setBlocks([...blocks, duplicated]);
    setActiveBlockId(newId);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  React.useEffect(() => {
    if (previewDevice === 'desktop') {
      setIsLibraryVisible(false);
    } else {
      setIsLibraryVisible(true);
    }
  }, [previewDevice]);

  const activeBlock = blocks.find(b => b.id === activeBlockId) || blocks[0];

  return (
    <div className="bg-[#0a0a0a] text-[#e5e2e1] h-screen overflow-hidden flex font-sans">
      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Builder Header */}
        <header className="h-14 border-b border-[#1a1a1a] flex items-center justify-between px-6 bg-[#0a0a0a] shrink-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/workspace')}
              className="text-[#555] hover:text-white transition-colors flex items-center"
            >
              <span className="material-symbols-outlined mr-2">arrow_back</span>
              <span className="font-label-md text-label-md">Exit</span>
            </button>
            <div className="h-4 w-px bg-outline-variant mx-2"></div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-white font-headline-md text-headline-md font-semibold p-0 w-64 focus:border-b focus:border-primary focus:outline-none"
              />
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">edit</span>
            </div>

            <div className="ml-4 px-2 py-0.5 bg-primary/10 border border-primary/20 rounded text-primary font-label-sm text-label-sm flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Draft
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Form Mode Toggle */}
            <div className="flex bg-surface-container-high rounded-lg p-0.5 border border-outline-variant">
              <button
                onClick={() => setFormMode('conversational')}
                className={`px-3 py-1.5 rounded font-label-sm text-label-sm flex items-center gap-1.5 transition-all ${formMode === 'conversational' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
              >
                <span className="material-symbols-outlined text-[14px]">swipe_up</span>
                Conversational
              </button>
              <button
                onClick={() => setFormMode('classic')}
                className={`px-3 py-1.5 rounded font-label-sm text-label-sm flex items-center gap-1.5 transition-all ${formMode === 'classic' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
              >
                <span className="material-symbols-outlined text-[14px]">view_agenda</span>
                Classic
              </button>
            </div>
            <div className="flex items-center gap-4 border-r border-outline-variant pr-6 text-on-surface-variant">
              <button className="hover:text-primary transition-colors"><span className="material-symbols-outlined">undo</span></button>
              <button className="hover:text-primary transition-colors"><span className="material-symbols-outlined">redo</span></button>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate(`/dashboard/customer-feedback`)}
                className="px-4 py-2 border border-outline-variant hover:border-primary text-on-surface hover:text-primary transition-all font-label-md text-label-md flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">visibility</span>
                View Dashboard
              </button>
              <button
                onClick={() => alert('Form published! Responses will now compile.')}
                className="px-6 py-2 bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container hover:electric-violet-glow transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                Publish Form
              </button>
            </div>
          </div>
        </header>

        {/* Builder Workspace Area */}
        <div className="flex-1 flex overflow-hidden relative">

          {/* Left Side: Component Elements Library */}
          <aside className={`${isLibraryVisible ? 'w-64 border-r border-[#1a1a1a] opacity-100' : 'w-0 opacity-0'} bg-[#0a0a0a] flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden`}>
            <div className="p-4 border-b border-outline-variant whitespace-nowrap flex justify-between items-center">
              <div>
                <h2 className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider text-xs">Library Elements</h2>
                {formMode === 'classic' && (
                  <p className="text-[10px] text-primary mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[10px]">info</span>
                    Classic mode — all fields visible
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsLibraryVisible(false)}
                className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                title="Hide Library"
              >
                <span className="material-symbols-outlined text-[18px]">keyboard_double_arrow_left</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-custom">

              {/* Basic Fields (Grid) */}
              <div>
                <h3 className="font-label-sm text-label-sm text-on-surface-variant mb-3">Basic Inputs</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => addBlock('text', 'Short Text', 'short_text')}
                    className="border border-outline-variant bg-surface-container-high p-3 flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors text-on-surface-variant rounded-sm text-left"
                  >
                    <span className="material-symbols-outlined text-[20px]">short_text</span>
                    <span className="text-[9px] uppercase font-bold tracking-wider">Short Text</span>
                  </button>
                  <button
                    onClick={() => addBlock('longtext', 'Long Text', 'notes')}
                    className="border border-outline-variant bg-surface-container-high p-3 flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors text-on-surface-variant rounded-sm"
                  >
                    <span className="material-symbols-outlined text-[20px]">notes</span>
                    <span className="text-[9px] uppercase font-bold tracking-wider">Long Text</span>
                  </button>
                  <button
                    onClick={() => addBlock('choice', 'Choice Option', 'radio_button_checked')}
                    className="border border-outline-variant bg-surface-container-high p-3 flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors text-on-surface-variant rounded-sm"
                  >
                    <span className="material-symbols-outlined text-[20px]">radio_button_checked</span>
                    <span className="text-[9px] uppercase font-bold tracking-wider">Choice</span>
                  </button>
                  <button
                    onClick={() => addBlock('checkbox', 'Checkboxes', 'check_box')}
                    className="border border-outline-variant bg-surface-container-high p-3 flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors text-on-surface-variant rounded-sm"
                  >
                    <span className="material-symbols-outlined text-[20px]">check_box</span>
                    <span className="text-[9px] uppercase font-bold tracking-wider">Checkboxes</span>
                  </button>
                  <button
                    onClick={() => addBlock('dropdown', 'Dropdown', 'arrow_drop_down_circle')}
                    className="border border-outline-variant bg-surface-container-high p-3 flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors text-on-surface-variant rounded-sm col-span-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">arrow_drop_down_circle</span>
                    <span className="text-[9px] uppercase font-bold tracking-wider">Dropdown</span>
                  </button>
                </div>
              </div>

              {/* Ready-to-use Templates (Compact List) */}
              <div>
                <h3 className="font-label-sm text-label-sm text-on-surface-variant mb-3">Templates</h3>
                <div className="flex flex-col gap-1">
                  <button onClick={() => addBlock('fullname', 'Full Name', 'person')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">Full Name</span>
                  </button>
                  <button onClick={() => addBlock('email', 'Email Address', 'mail')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">mail</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">Email</span>
                  </button>
                  <button onClick={() => addBlock('phone', 'Phone Number', 'call')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">call</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">Phone Number</span>
                  </button>
                  <button onClick={() => addBlock('address', 'Address', 'home')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">home</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">Address</span>
                  </button>
                  <button onClick={() => addBlock('company', 'Company Name', 'domain')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">domain</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">Company</span>
                  </button>
                  <button onClick={() => addBlock('country', 'Country Selector', 'public')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">public</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">Country</span>
                  </button>
                  <button onClick={() => addBlock('language', 'Language Selector', 'translate')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">translate</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">Language</span>
                  </button>
                  <button onClick={() => addBlock('url', 'Website URL', 'link')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">link</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">Website URL</span>
                  </button>
                  <button onClick={() => addBlock('password', 'Password', 'password')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">password</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">Password</span>
                  </button>
                  <button onClick={() => addBlock('date', 'Date Picker', 'calendar_today')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">Date</span>
                  </button>
                  <button onClick={() => addBlock('time', 'Time Picker', 'schedule')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">Time</span>
                  </button>
                  <button onClick={() => addBlock('date_range', 'Date Range', 'date_range')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">date_range</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">Date Range</span>
                  </button>
                  <button onClick={() => addBlock('number', 'Number Field', 'tag')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">tag</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">Number</span>
                  </button>
                </div>
              </div>

              {/* Interactive & Specialized */}
              <div>
                <h3 className="font-label-sm text-label-sm text-on-surface-variant mb-3">Interactive</h3>
                <div className="flex flex-col gap-1">
                  <button onClick={() => addBlock('matrix', 'Matrix / Grid', 'grid_on')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">grid_on</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">Matrix / Grid</span>
                  </button>
                  <button onClick={() => addBlock('slider', 'Slider', 'linear_scale')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">linear_scale</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">Slider</span>
                  </button>
                  <button onClick={() => addBlock('counter', 'Counter (+/-)', 'exposure')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">exposure</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">Counter</span>
                  </button>
                  <button onClick={() => addBlock('tags', 'Tags / Chips', 'label')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">label</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">Tags / Chips</span>
                  </button>
                  <button onClick={() => addBlock('color_picker', 'Color Picker', 'palette')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">palette</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">Color Picker</span>
                  </button>
                  <button onClick={() => addBlock('otp', 'OTP Input', 'pin')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">pin</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">OTP Input</span>
                  </button>
                </div>
              </div>

              {/* Ratings & Scales */}
              <div>
                <h3 className="font-label-sm text-label-sm text-on-surface-variant mb-3">Ratings & Scales</h3>
                <div className="flex flex-col gap-1">
                  <button onClick={() => addBlock('rating_stars', 'Star Rating', 'star')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">star</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">Star Rating</span>
                  </button>
                  <button onClick={() => addBlock('emoji_rating', 'Emoji Rating', 'mood')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">mood</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">Emoji Rating</span>
                  </button>
                  <button onClick={() => addBlock('nps', 'NPS (0-10)', 'speed')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">speed</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">NPS (0-10)</span>
                  </button>
                  <button onClick={() => addBlock('linear_scale', 'Linear Scale', 'linear_scale')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">linear_scale</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">Linear Scale (1-5)</span>
                  </button>
                  <button onClick={() => addBlock('yes_no', 'Yes/No Toggle', 'toggle_on')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">toggle_on</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">Yes / No Toggle</span>
                  </button>
                </div>
              </div>

              {/* Advanced & Legal */}
              <div>
                <h3 className="font-label-sm text-label-sm text-on-surface-variant mb-3">Advanced & Legal</h3>
                <div className="flex flex-col gap-1">
                  <button onClick={() => addBlock('credit_card', 'Credit Card Payment', 'credit_card')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">credit_card</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">Credit Card</span>
                  </button>
                  <button onClick={() => addBlock('fileupload', 'File Upload', 'upload_file')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">upload_file</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">File Upload</span>
                  </button>
                  <button onClick={() => addBlock('signature', 'Signature Pad', 'draw')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">draw</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">Signature Pad</span>
                  </button>
                  <button onClick={() => addBlock('terms', 'Terms & Conditions', 'gavel')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">gavel</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">Terms & Conditions</span>
                  </button>
                </div>
              </div>

              {/* Layout */}
              <div>
                <h3 className="font-label-sm text-label-sm text-on-surface-variant mb-3">Layout</h3>
                <div className="flex flex-col gap-1">
                  <button onClick={() => addBlock('heading', 'Section Heading', 'title')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">title</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">Section Heading</span>
                  </button>
                  <button onClick={() => addBlock('divider', 'Divider', 'horizontal_rule')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">horizontal_rule</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">Divider</span>
                  </button>
                  <button onClick={() => addBlock('spacer', 'Spacer', 'space_bar')} className="w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group">
                    <span className="material-symbols-outlined text-[18px]">space_bar</span>
                    <span className="text-[12px] font-medium tracking-wide flex-1">Spacer</span>
                  </button>
                </div>
              </div>

              {/* Smart AI Fields */}
              <div>
                <h3 className="font-label-sm text-label-sm text-on-surface-variant mb-3 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-primary">auto_awesome</span>
                  Smart AI Fields
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => addBlock('sentiment', 'AI Sentiment', 'psychology')}
                    className="w-full border border-outline-variant bg-surface-container-high p-3 flex items-center gap-3 hover:border-primary transition-colors text-left rounded-sm relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="material-symbols-outlined text-primary">psychology</span>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface">AI Sentiment</span>
                      <span className="text-[9px] text-on-surface-variant uppercase tracking-wider">Analysis text inputs</span>
                    </div>
                  </button>

                  <button
                    onClick={() => addBlock('upload', 'Smart Upload', 'document_scanner')}
                    className="w-full border border-outline-variant bg-surface-container-high p-3 flex items-center gap-3 hover:border-primary transition-colors text-left rounded-sm relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="material-symbols-outlined text-primary">document_scanner</span>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface">Smart Upload</span>
                      <span className="text-[9px] text-on-surface-variant uppercase tracking-wider">Auto-extract metadata</span>
                    </div>
                  </button>
                </div>
              </div>

            </div>
          </aside>

          {/* Floating Expand Tab when Library is Hidden */}
          {!isLibraryVisible && (
            <button
              onClick={() => setIsLibraryVisible(true)}
              className="absolute left-0 top-4 bg-[#131313] border border-[#1a1a1a] border-l-0 rounded-r-lg p-2 text-gray-400 hover:text-white hover:bg-gray-800 z-50 shadow-lg transition-colors group flex items-center"
              title="Show Library Elements"
            >
              <span className="material-symbols-outlined text-[18px]">keyboard_double_arrow_right</span>
            </button>
          )}

          {/* Center Canvas (Light background workspace style as requested) */}
          <div className="flex-1 light-workspace bg-[#f8f9fa] relative overflow-hidden flex flex-col">

            {/* Canvas Controls */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <button
                onClick={() => setZoom(Math.min(zoom + 10, 200))}
                className="w-8 h-8 bg-white border border-gray-200 text-gray-600 flex items-center justify-center hover:text-primary hover:border-primary transition-colors shadow-sm rounded-sm"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
              <button
                onClick={() => setZoom(Math.max(zoom - 10, 50))}
                className="w-8 h-8 bg-white border border-gray-200 text-gray-600 flex items-center justify-center hover:text-primary hover:border-primary transition-colors shadow-sm rounded-sm"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <div className="w-px h-8 bg-gray-200 mx-1"></div>
              <button
                onClick={() => setZoom(100)}
                className="px-3 h-8 bg-white border border-gray-200 text-gray-600 flex items-center justify-center hover:text-primary hover:border-primary transition-colors shadow-sm font-label-sm text-label-sm rounded-sm"
              >
                {zoom}%
              </button>
            </div>

            {/* Blocks flow list */}
            <div className="flex-1 overflow-y-auto builder-scroll p-12 flex flex-col items-center">
              <div
                className="w-full max-w-xl pb-32 pt-8 transition-transform duration-200 origin-top"
                style={{ transform: `scale(${zoom / 100})` }}
              >

                {/* Canvas Header */}
                <div className="w-full mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">{formTitle}</h1>
                      <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">
                        {blocks.length} fields &middot; {formMode === 'conversational' ? 'Conversational Flow' : `Classic Layout · Page ${currentPage} of ${totalPages}`}
                      </p>
                    </div>
                    <button
                      onClick={() => setFormMode(formMode === 'conversational' ? 'classic' : 'conversational')}
                      className="text-[10px] text-gray-400 uppercase tracking-wider bg-white border border-gray-200 px-3 py-1 rounded-full hover:border-primary hover:text-primary transition-colors"
                    >
                      {formMode === 'conversational' ? 'Flow View' : 'Page View'}
                    </button>
                  </div>

                  {/* Classic Mode: Page Tabs */}
                  {formMode === 'classic' && (
                    <div className="flex items-center gap-2 mt-4">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${currentPage === page
                              ? 'bg-gray-900 text-white shadow-sm'
                              : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'
                            }`}
                        >
                          Page {page}
                        </button>
                      ))}
                      <button
                        onClick={() => { setTotalPages(totalPages + 1); setCurrentPage(totalPages + 1); }}
                        className="w-7 h-7 flex items-center justify-center bg-white border border-dashed border-gray-300 text-gray-400 hover:border-gray-500 hover:text-gray-600 transition-colors"
                        title="Add Page"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                      {totalPages > 1 && (
                        <button
                          onClick={() => { if (totalPages > 1) { setTotalPages(totalPages - 1); if (currentPage > totalPages - 1) setCurrentPage(totalPages - 1); } }}
                          className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors ml-1"
                          title="Remove Last Page"
                        >
                          <span className="material-symbols-outlined text-[16px]">remove</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Start Node */}
                <div className="flex justify-center mb-6">
                  <div className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-600 font-label-sm text-label-sm uppercase tracking-widest rounded-full flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                    Start Node
                  </div>
                </div>

                {/* Connector */}
                <div className="w-px h-8 bg-gray-300 mx-auto mb-2 relative"></div>

                {/* Dynamic Block Rendering */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                    {blocks.map((block, index) => {
                      const isActive = block.id === activeBlockId;
                      return (
                        <SortableBlock key={block.id} id={block.id}>
                          {({ listeners, attributes }) => (
                            <div className="w-full">
                              {/* Form Block Item */}
                              <div
                                onClick={() => setActiveBlockId(block.id)}
                                className={`bg-white border text-gray-900 sharp-corners shadow-sm relative group transition-all duration-200 cursor-pointer ${isActive
                                    ? 'border-primary ring-2 ring-primary/20 shadow-[0_0_20px_rgba(208,188,255,0.15)]'
                                    : 'border-gray-200 hover:border-primary'
                                  }`}
                              >
                                {/* Drag Handle on active */}
                                {isActive && (
                                  <div
                                    {...listeners}
                                    {...attributes}
                                    className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing bg-[#fbf9ff] border-r border-[#d0bcff]/30 text-primary z-10"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">drag_indicator</span>
                                  </div>
                                )}

                                {/* AI Indicator badge */}
                                {(block.type === 'sentiment' || block.type === 'upload' || block.aiLogic) && (
                                  <div className="absolute -top-3 right-4 bg-[#131313] text-[#d0bcff] px-2 py-0.5 flex items-center gap-1 border border-[#d0bcff]/30 text-[9px] uppercase font-bold tracking-wider sharp-corners">
                                    <span className="material-symbols-outlined text-[11px] animate-pulse">auto_awesome</span>
                                    AI Logic
                                  </div>
                                )}

                                {/* Block Header */}
                                <div className={`px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 ${isActive ? 'ml-8' : ''}`}>
                                  <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-gray-400 text-[18px]">{block.icon || 'description'}</span>
                                    <span className="font-label-sm text-label-sm text-gray-700 font-bold">{block.typeName}</span>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex gap-3 items-center" onClick={(e) => e.stopPropagation()}>
                                    {block.type !== 'welcome' && (
                                      <>
                                        <button
                                          onClick={() => updateBlockValue(block.id, 'required', !block.required)}
                                          className={`flex items-center gap-1 font-label-sm text-[10px] uppercase font-bold px-2 py-1 rounded transition-colors ${block.required
                                              ? 'bg-primary/10 text-primary border border-primary/20'
                                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                            }`}
                                          title="Toggle Required"
                                        >
                                          <span className="material-symbols-outlined text-[14px]">
                                            {block.required ? 'star' : 'star_border'}
                                          </span>
                                          Required
                                        </button>
                                        <div className="w-px h-4 bg-gray-200"></div>
                                      </>
                                    )}
                                    <button
                                      onClick={() => duplicateBlock(block)}
                                      className="text-gray-400 hover:text-gray-800 transition-colors"
                                      title="Duplicate"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                    </button>
                                    <button
                                      onClick={() => deleteBlock(block.id)}
                                      className="text-gray-400 hover:text-red-500"
                                      title="Delete"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">delete</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Block Content Inputs */}
                                <div className={`p-6 ${isActive ? 'ml-8' : ''}`}>
                                  {/* Question/Title Input */}
                                  <input
                                    type="text"
                                    value={block.title}
                                    onChange={(e) => updateBlockValue(block.id, 'title', e.target.value)}
                                    placeholder="Enter question wording..."
                                    className="w-full font-body-lg text-body-lg font-medium text-gray-900 border-none bg-transparent focus:ring-0 p-0 mb-4 focus:border-b focus:border-primary focus:outline-none"
                                  />

                                  {/* Welcome Screen Subtitle */}
                                  {block.type === 'welcome' && (
                                    <textarea
                                      value={block.description}
                                      onChange={(e) => updateBlockValue(block.id, 'description', e.target.value)}
                                      placeholder="Subtitle description..."
                                      className="w-full font-body-md text-body-md text-gray-500 border-none bg-transparent focus:ring-0 p-0 resize-none h-12 focus:border-b focus:border-primary focus:outline-none"
                                    />
                                  )}

                                  {/* Block Option details */}
                                  {block.type === 'rating' && (
                                    <div className="flex justify-between items-center gap-2 mt-4">
                                      {block.options?.map((opt, i) => (
                                        <div key={i} className="flex flex-col items-center gap-1">
                                          <div className="w-10 h-10 border border-gray-200 bg-gray-50 flex items-center justify-center font-bold text-gray-500 text-sm">
                                            {opt.value}
                                          </div>
                                          <span className="text-[9px] text-gray-400">{opt.label}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Choice/Dropdown Options List */}
                                  {(block.type === 'choice' || block.type === 'dropdown') && (
                                    <div className="space-y-2 mt-2">
                                      {block.options?.map((opt, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                          <span className="material-symbols-outlined text-gray-300 text-sm">radio_button_unchecked</span>
                                          <input
                                            type="text"
                                            value={opt.label}
                                            onChange={(e) => {
                                              const newOpts = [...block.options];
                                              newOpts[i].label = e.target.value;
                                              updateBlockValue(block.id, 'options', newOpts);
                                            }}
                                            className="bg-transparent border-none text-gray-700 text-sm p-0 focus:ring-0 focus:border-b focus:border-primary focus:outline-none"
                                          />
                                        </div>
                                      ))}
                                      <button
                                        onClick={() => {
                                          const newOpts = [...block.options, { value: `${block.options.length + 1}`, label: `Option ${block.options.length + 1}` }];
                                          updateBlockValue(block.id, 'options', newOpts);
                                        }}
                                        className="text-primary text-xs font-semibold hover:underline mt-2 flex items-center gap-1"
                                      >
                                        <span className="material-symbols-outlined text-xs">add</span> Add Option
                                      </button>
                                    </div>
                                  )}

                                  {/* AI Logic Display */}
                                  {block.aiLogic && (
                                    <div className="mt-6 p-3 bg-gray-50 border border-gray-100 flex items-start gap-3">
                                      <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">account_tree</span>
                                      <div>
                                        <span className="block text-xs font-bold text-gray-700 mb-1">Logic Branching Active</span>
                                        <span className="block text-xs text-gray-500">{block.aiLogic}</span>
                                      </div>
                                    </div>
                                  )}

                                  {/* AI Sentiment Feedback Display */}
                                  {block.type === 'sentiment' && (
                                    <div className="mt-4 p-3 bg-[#fbf9ff] border border-primary/20 flex items-center gap-2 text-primary">
                                      <span className="material-symbols-outlined text-[18px]">psychology</span>
                                      <span className="text-xs font-medium">Automatic sentiment analyzer evaluates response polarity.</span>
                                    </div>
                                  )}

                                  {/* Smart Upload Display */}
                                  {block.type === 'upload' && (
                                    <div className="mt-4 border-2 border-dashed border-gray-200 p-6 flex flex-col items-center justify-center text-gray-400">
                                      <span className="material-symbols-outlined text-[32px] mb-2 text-gray-300">cloud_upload</span>
                                      <span className="text-xs">Drag and drop file here, or click to upload</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Connector Line below item */}
                              {index < blocks.length - 1 && (
                                <div className="relative w-full h-12 flex items-center justify-center">
                                  <div className="absolute inset-0 flex justify-center"><div class="w-px h-full bg-gray-300"></div></div>
                                  <button className="relative z-10 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary hover:scale-110 transition-all shadow-sm">
                                    <span className="material-symbols-outlined text-[16px]">add</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </SortableBlock>
                      );
                    })}
                  </SortableContext>
                </DndContext>

                {/* End node */}
                <div className="relative w-full h-12 flex items-center justify-center my-2">
                  <div className="absolute inset-0 flex justify-center"><div class="w-px h-full bg-gray-300"></div></div>
                </div>
                <div className="flex justify-center">
                  <div className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-600 font-label-sm text-label-sm uppercase tracking-widest rounded-full flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    End Screen
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Right Side: Immersive Device Live Preview */}
          <aside className={`bg-[#0a0a0a] border-l border-[#1a1a1a] flex flex-col items-center py-6 z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] shrink-0 transition-all duration-300 ${previewDevice === 'mobile' ? 'w-[420px]' : 'w-[65%]'}`}>
            <div className="flex items-center justify-between w-full px-6 mb-6">
              <h3 className="font-label-md text-label-md text-on-surface">Live Preview</h3>
              <div className="flex bg-surface-container-high rounded-lg p-1">
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-3 py-1 rounded font-label-sm text-label-sm flex items-center justify-center transition-colors ${previewDevice === 'mobile' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  <span className="material-symbols-outlined text-[16px]">smartphone</span>
                </button>
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-3 py-1 rounded font-label-sm text-label-sm flex items-center justify-center transition-colors ${previewDevice === 'desktop' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  <span className="material-symbols-outlined text-[16px]">desktop_windows</span>
                </button>
              </div>
            </div>

            {/* Preview Mockup Container */}
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
              <div className="flex-1 bg-white pt-10 pb-6 px-5 flex flex-col relative overflow-y-auto hide-scrollbar text-gray-900 text-left">
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
                  {blocks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                      <p className="text-sm">Empty Form</p>
                    </div>
                  ) : (formMode === 'conversational' ? [activeBlock] : blocks).map((renderBlock, idx) => {
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
                                  if (blocks.length > 1) {
                                    setActiveBlockId(blocks[1].id);
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

                        {['text', 'email', 'number', 'phone', 'url', 'password', 'company'].includes(activeBlock.type) && (
                          <div>
                            <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title}</h2>
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
                            <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title}</h2>
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
                            <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title}</h2>
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

                        {activeBlock.type === 'time' && (
                          <div>
                            <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title}</h2>
                            <div className="w-full p-3 border border-gray-200 rounded flex justify-between items-center text-sm text-gray-400 bg-gray-50">
                              <span>--:-- AM/PM</span>
                              <span className="material-symbols-outlined">schedule</span>
                            </div>
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
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title}</h2>
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

                        {activeBlock.type === 'otp' && (
                          <div>
                            <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title}</h2>
                            <div className="flex gap-2 justify-center">
                              {[1, 2, 3, 4, 5, 6].map(box => (
                                <div key={box} className="w-10 h-12 border-2 border-gray-200 rounded flex items-center justify-center text-gray-400 bg-white">
                                  -
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {activeBlock.type === 'color_picker' && (
                          <div>
                            <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title}</h2>
                            <div className="flex items-center gap-3 p-2 border border-gray-200 rounded bg-white">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500"></div>
                              <span className="text-sm text-gray-400">#HEXCODE</span>
                            </div>
                          </div>
                        )}

                        {activeBlock.type === 'tags' && (
                          <div>
                            <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title}</h2>
                            <div className="p-2 border border-gray-200 rounded bg-white flex gap-2 flex-wrap">
                              <span className="px-2 py-1 bg-gray-100 text-xs rounded-full flex items-center gap-1">Design <span className="material-symbols-outlined text-[12px]">close</span></span>
                              <span className="px-2 py-1 bg-gray-100 text-xs rounded-full flex items-center gap-1">UI/UX <span className="material-symbols-outlined text-[12px]">close</span></span>
                              <input type="text" disabled placeholder="Add tag..." className="bg-transparent outline-none text-sm w-20" />
                            </div>
                          </div>
                        )}

                        {activeBlock.type === 'credit_card' && (
                          <div>
                            <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title}</h2>
                            <div className="border border-gray-200 rounded overflow-hidden">
                              <div className="p-3 border-b border-gray-200 bg-white flex justify-between items-center">
                                <span className="text-gray-400 text-sm">Card Number</span>
                                <span className="material-symbols-outlined text-gray-300">credit_card</span>
                              </div>
                              <div className="flex bg-white">
                                <div className="p-3 border-r border-gray-200 flex-1 text-gray-400 text-sm">MM/YY</div>
                                <div className="p-3 flex-1 text-gray-400 text-sm">CVC</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeBlock.type === 'matrix' && (() => {
                          const val = previewData[activeBlock.id] || {};
                          const setVal = (row, col) => updatePreviewData(activeBlock.id, { ...val, [row]: col });
                          const renderRows = activeBlock.rows || ['Quality', 'Speed'];
                          const renderCols = activeBlock.columns || ['Poor', 'Avg', 'Good'];

                          return (
                            <div>
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title}</h2>
                              <div className="border border-gray-200 rounded bg-white overflow-hidden text-xs">
                                <div className="flex bg-gray-50 border-b border-gray-200 p-2 font-bold text-gray-500">
                                  <div className="w-1/3"></div>
                                  {renderCols.map(col => (
                                    <div key={col} className="flex-1 text-center">{col}</div>
                                  ))}
                                </div>
                                {renderRows.map((row, i) => (
                                  <div key={i} className="flex p-2 border-b border-gray-100 last:border-0 items-center">
                                    <div className="w-1/3 font-semibold text-gray-700">{row}</div>
                                    {renderCols.map(col => {
                                      const isSelected = val[row] === col;
                                      return (
                                        <div key={col} className="flex-1 flex justify-center">
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
                          );
                        })()}

                        {activeBlock.type === 'counter' && (() => {
                          const val = previewData[activeBlock.id] || 0;
                          return (
                            <div>
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title}</h2>
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
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title}</h2>
                              <div className="py-4 relative">
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
                            <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title}</h2>
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
                            <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title}</h2>
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
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title}</h2>
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
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title}</h2>
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
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title}</h2>
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

                        {activeBlock.type === 'longtext' && (
                          <div>
                            <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">
                              {activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}
                            </h2>
                            <textarea
                              disabled
                              placeholder={activeBlock.placeholder || 'Enter details...'}
                              className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 h-20 resize-none"
                            />
                          </div>
                        )}

                        {activeBlock.type === 'choice' && (
                          <div>
                            <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">
                              {activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}
                            </h2>
                            <div className="space-y-2">
                              {activeBlock.options?.map((opt, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 border border-gray-200 rounded bg-white">
                                  <span className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"></span>
                                  <span className="text-sm text-gray-700">{opt.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {activeBlock.type === 'dropdown' && (
                          <div>
                            <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">
                              {activeBlock.title} {activeBlock.required && <span className="text-red-500">*</span>}
                            </h2>
                            <div className="w-full p-3 border border-gray-200 rounded flex justify-between items-center text-sm text-gray-400 bg-gray-50">
                              <span>Select an option...</span>
                              <span className="material-symbols-outlined">arrow_drop_down</span>
                            </div>
                          </div>
                        )}

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
                            <button className="flex-1 ml-4 h-8 bg-gray-900 text-white flex items-center justify-center font-bold text-xs tracking-wider uppercase rounded-sm hover:bg-black">
                              Submit
                            </button>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <button className="w-full h-10 bg-gray-900 text-white flex items-center justify-center font-bold text-sm tracking-wider uppercase rounded-sm hover:bg-black transition-colors">
                      {currentPage < totalPages ? 'Next Page' : 'Submit'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </aside>

        </div>

      </main>

    </div>
  );
}
