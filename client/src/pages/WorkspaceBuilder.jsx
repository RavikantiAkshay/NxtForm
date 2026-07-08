import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  useDraggable,
  useDroppable,
  DragOverlay
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

const DraggableLibraryItem = ({ type, label, icon, desc, onClick }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-item-${type}`,
    data: {
      type: 'library-item',
      blockType: type,
      label,
      icon,
      desc
    }
  });

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-2 hover:bg-[#1a1a1a] text-on-surface-variant hover:text-primary rounded transition-colors text-left group ${isDragging ? 'opacity-50' : ''} ${desc ? 'border border-outline-variant bg-surface-container-high p-3 relative overflow-hidden' : ''}`}
    >
      {desc && <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
      <span className={`material-symbols-outlined ${desc ? 'text-primary text-[18px]' : 'text-[18px]'}`}>{icon}</span>
      {desc ? (
        <div className="flex flex-col">
          <span className="font-label-sm text-label-sm text-on-surface">{label}</span>
          <span className="text-[9px] text-on-surface-variant uppercase tracking-wider">{desc}</span>
        </div>
      ) : (
        <span className="text-[12px] font-medium tracking-wide flex-1">{label}</span>
      )}
    </button>
  );
};

const DraggableGridItem = ({ type, label, icon, onClick, isFullWidth }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `grid-item-${type}`,
    data: {
      type: 'library-item',
      blockType: type,
      label,
      icon
    }
  });

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`border border-outline-variant bg-surface-container-high p-3 flex flex-col items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors text-on-surface-variant rounded-sm text-center ${isDragging ? 'opacity-50' : ''} ${isFullWidth ? 'col-span-2' : ''}`}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
      <span className="text-[9px] uppercase font-bold tracking-wider">{label}</span>
    </button>
  );
};

const DropZone = ({ index }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `dropzone-${index}`,
    data: {
      type: 'dropzone',
      index
    }
  });

  return (
    <div
      ref={setNodeRef}
      className="relative z-10 w-full flex items-center justify-center h-full"
    >
      <button className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-sm border ${isOver ? 'bg-primary text-white border-primary scale-150' : 'bg-white text-gray-400 border-gray-300 hover:text-primary hover:border-primary hover:scale-110'}`}>
        <span className="material-symbols-outlined text-[16px]">add</span>
      </button>
    </div>
  );
};

export default function WorkspaceBuilder() {
  const navigate = useNavigate();
  const location = useLocation();

  // State for form blocks
  const [formTitle, setFormTitle] = useState('Customer Feedback Survey 2024');
  const [activeBlockId, setActiveBlockId] = useState('rating-1');
  const [formMode, setFormMode] = useState('conversational'); // 'conversational' or 'classic'
  const [activeDragItem, setActiveDragItem] = useState(null);
  const [previewDevice, setPreviewDevice] = useState('mobile'); // 'mobile' or 'desktop'
  const [isLibraryVisible, setIsLibraryVisible] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [templateSearch, setTemplateSearch] = useState('');
  const [previewData, setPreviewData] = useState({});
  const [isPublishing, setIsPublishing] = useState(false);
  const [formId, setFormId] = useState(null);
  const [lastPublishedState, setLastPublishedState] = useState(null);
  const updatePreviewData = (id, val) => setPreviewData(prev => ({ ...prev, [id]: val }));
  const initialBlocks = [
    {
      id: 'welcome',
      type: 'welcome',
      icon: 'waving_hand',
      typeName: 'Welcome Screen',
      title: 'Welcome to our annual survey!',
      description: 'We value your feedback to help us improve our services.',
      buttonText: 'Start Survey',
      required: false,
      page: 1,
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
      page: 1,
    }
  ];

  const [blocks, setBlocksState] = useState(initialBlocks);
  const [blockHistory, setBlockHistory] = useState([initialBlocks]);
  const [blockHistoryIndex, setBlockHistoryIndex] = useState(0);

  useEffect(() => {
    if (location.state?.formId) {
      const fetchForm = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/forms/${location.state.formId}`);
          if (response.ok) {
            const data = await response.json();
            setFormId(data._id);
            setFormTitle(data.title);
            setFormMode(data.mode);
            setBlocksState(data.blocks);
            setBlockHistory([data.blocks]);
            setBlockHistoryIndex(0);
            
            const currentState = JSON.stringify({
              title: data.title,
              mode: data.mode,
              blocks: data.blocks
            });
            setLastPublishedState(currentState);
            
            // Re-calculate total pages
            const maxPage = Math.max(...data.blocks.map(b => b.page || 1), 1);
            setTotalPages(maxPage);
          }
        } catch (error) {
          console.error("Failed to fetch form:", error);
        }
      };
      fetchForm();
    }
  }, [location.state?.formId]);

  const setBlocks = (newBlocksOrUpdater) => {
    setBlocksState(prev => {
      const newBlocks = typeof newBlocksOrUpdater === 'function' ? newBlocksOrUpdater(prev) : newBlocksOrUpdater;
      
      const newHistory = blockHistory.slice(0, blockHistoryIndex + 1);
      newHistory.push(newBlocks);
      setBlockHistory(newHistory);
      setBlockHistoryIndex(newHistory.length - 1);
      
      return newBlocks;
    });
  };

  const handleUndo = () => {
    if (blockHistoryIndex > 0) {
      setBlockHistoryIndex(blockHistoryIndex - 1);
      setBlocksState(blockHistory[blockHistoryIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (blockHistoryIndex < blockHistory.length - 1) {
      setBlockHistoryIndex(blockHistoryIndex + 1);
      setBlocksState(blockHistory[blockHistoryIndex + 1]);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const token = localStorage.getItem('nxtform_token');
      if (!token) {
        alert('You must be logged in to publish a form.');
        setIsPublishing(false);
        return;
      }

      const currentState = JSON.stringify({
        title: formTitle,
        mode: formMode,
        blocks: blocks
      });

      if (lastPublishedState === currentState) {
        alert('Form is already published and up-to-date!');
        setIsPublishing(false);
        return;
      }

      const url = formId ? `http://localhost:5000/api/forms/${formId}` : 'http://localhost:5000/api/forms';
      const method = formId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: currentState
      });

      if (response.ok) {
        const data = await response.json();
        setFormId(data._id);
        setLastPublishedState(currentState);
        alert(`Form ${formId ? 'updated' : 'published'} successfully! Unique ID: ${data._id}`);
      } else {
        const errorData = await response.json();
        alert(`Failed to publish form: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error publishing form:', error);
      alert('An error occurred while publishing the form.');
    }
    setIsPublishing(false);
  };

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
      page: currentPage,
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

    if (type === 'choice' || type === 'dropdown' || type === 'checkbox') {
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

  const handleDragStart = (event) => {
    const { active } = event;
    if (active.data.current?.type === 'library-item') {
      setActiveDragItem(active.data.current);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveDragItem(null);
      return;
    }

    if (active.data.current?.type === 'library-item' && over.data.current?.type === 'dropzone') {
      const { blockType, label, icon } = active.data.current;
      const insertIndex = over.data.current.index;
      
      const newId = `${blockType}-${Date.now()}`;
      const newBlock = {
        id: newId,
        type: blockType,
        typeName: label,
        title: label,
        icon: icon,
        required: false,
        page: currentPage
      };

      if (['choice', 'dropdown', 'checkbox'].includes(blockType)) {
        newBlock.options = [
          { value: 'option-1', label: 'Option 1' },
          { value: 'option-2', label: 'Option 2' },
          { value: 'option-3', label: 'Option 3' }
        ];
      } else if (blockType === 'rating') {
        newBlock.options = [
          { value: '1', label: 'Very Poor' },
          { value: '2', label: 'Poor' },
          { value: '3', label: 'Average' },
          { value: '4', label: 'Good' },
          { value: '5', label: 'Excellent' }
        ];
      } else if (blockType === 'sentiment' || blockType === 'upload') {
        newBlock.description = blockType === 'sentiment' ? 'AI Sentiment Analyzer will flag emotional context.' : 'Smart Upload will extract metadata automatically.';
        newBlock.required = true;
      } else if (['text', 'longtext', 'email', 'number', 'phone', 'url', 'password', 'company'].includes(blockType)) {
        newBlock.placeholder = `Enter ${label.toLowerCase()}...`;
      }

      if (blockType === 'terms') {
        newBlock.options = [{ label: 'I agree to the Terms & Conditions and Privacy Policy' }];
      }

      setBlocks(prev => {
        const visibleBlocksForPage = formMode === 'classic' ? prev.filter(b => b.page === currentPage) : prev;
        const updated = [...prev];
        
        let globalInsertIndex = prev.length;
        if (insertIndex < visibleBlocksForPage.length) {
          globalInsertIndex = prev.findIndex(b => b.id === visibleBlocksForPage[insertIndex].id);
        } else if (visibleBlocksForPage.length > 0) {
          globalInsertIndex = prev.findIndex(b => b.id === visibleBlocksForPage[visibleBlocksForPage.length - 1].id) + 1;
        }

        updated.splice(globalInsertIndex, 0, newBlock);
        return updated;
      });
      setActiveBlockId(newId);
      setActiveDragItem(null);
      return;
    }

    if (active.id !== over.id && !active.data.current?.type) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        if(oldIndex === -1 || newIndex === -1) return items;
        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveDragItem(null);
  };

  React.useEffect(() => {
    if (previewDevice === 'desktop') {
      setIsLibraryVisible(false);
    } else {
      setIsLibraryVisible(true);
    }
  }, [previewDevice]);

  const activeBlock = blocks.find(b => b.id === activeBlockId) || blocks[0];
  const visibleBlocks = formMode === 'classic' ? blocks.filter(b => b.page === currentPage) : blocks;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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
              <button 
                onClick={handleUndo} 
                disabled={blockHistoryIndex === 0}
                className={`transition-colors ${blockHistoryIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:text-primary'}`}
              >
                <span className="material-symbols-outlined">undo</span>
              </button>
              <button 
                onClick={handleRedo} 
                disabled={blockHistoryIndex === blockHistory.length - 1}
                className={`transition-colors ${blockHistoryIndex === blockHistory.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:text-primary'}`}
              >
                <span className="material-symbols-outlined">redo</span>
              </button>
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
                onClick={handlePublish}
                disabled={isPublishing}
                className={`px-6 py-2 ${isPublishing ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-container hover:electric-violet-glow'} text-on-primary font-label-md text-label-md font-bold transition-all flex items-center gap-2`}
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {isPublishing ? 'sync' : 'send'}
                </span>
                {isPublishing ? 'Publishing...' : 'Publish Form'}
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
                  <DraggableGridItem type="text" label="Short Text" icon="short_text" onClick={() => addBlock('text', 'Short Text', 'short_text')} />
                  <DraggableGridItem type="longtext" label="Long Text" icon="notes" onClick={() => addBlock('longtext', 'Long Text', 'notes')} />
                  <DraggableGridItem type="choice" label="Choice Option" icon="radio_button_checked" onClick={() => addBlock('choice', 'Choice Option', 'radio_button_checked')} />
                  <DraggableGridItem type="checkbox" label="Checkboxes" icon="check_box" onClick={() => addBlock('checkbox', 'Checkboxes', 'check_box')} />
                  <DraggableGridItem type="dropdown" label="Dropdown" icon="arrow_drop_down_circle" isFullWidth onClick={() => addBlock('dropdown', 'Dropdown', 'arrow_drop_down_circle')} />
                </div>
              </div>

              {/* Ready-to-use Templates (Compact List) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-label-sm text-label-sm text-on-surface-variant">Templates</h3>
                  <div className="flex items-center bg-[#1a1a1a] rounded px-2 py-1 w-32">
                    <span className="material-symbols-outlined text-[12px] text-gray-500 mr-1">search</span>
                    <input 
                      type="text" 
                      placeholder="Search..." 
                      value={templateSearch}
                      onChange={(e) => setTemplateSearch(e.target.value)}
                      className="bg-transparent border-none outline-none text-[10px] text-white w-full placeholder-gray-500"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {[
                    { type: 'fullname', label: 'Full Name', icon: 'person' },
                    { type: 'email', label: 'Email Address', icon: 'mail' },
                    { type: 'phone', label: 'Phone Number', icon: 'call' },
                    { type: 'address', label: 'Address', icon: 'home' },
                    { type: 'company', label: 'Company Name', icon: 'domain' },
                    { type: 'country', label: 'Country Selector', icon: 'public' },
                    { type: 'language', label: 'Language Selector', icon: 'translate' },
                    { type: 'url', label: 'Website URL', icon: 'link' },
                    { type: 'password', label: 'Password', icon: 'password' },
                    { type: 'date', label: 'Date Picker', icon: 'calendar_today' },
                    { type: 'time', label: 'Time Picker', icon: 'schedule' },
                    { type: 'date_range', label: 'Date Range', icon: 'date_range' },
                    { type: 'number', label: 'Number Field', icon: 'tag' }
                  ].filter(t => t.label.toLowerCase().includes(templateSearch.toLowerCase())).map(t => (
                    <DraggableLibraryItem key={t.type} type={t.type} label={t.label} icon={t.icon} onClick={() => addBlock(t.type, t.label, t.icon)} />
                  ))}
                </div>
              </div>

              {/* Interactive & Specialized */}
              {/* Interactive & Specialized */}
              {[{ type: 'matrix', label: 'Matrix / Grid', icon: 'grid_on' },
                { type: 'slider', label: 'Slider', icon: 'linear_scale' },
                { type: 'counter', label: 'Counter (+/-)', icon: 'exposure' },
                { type: 'tags', label: 'Tags / Chips', icon: 'label' },
                { type: 'color_picker', label: 'Color Picker', icon: 'palette' },
                { type: 'otp', label: 'OTP Input', icon: 'pin' }
               ].filter(t => t.label.toLowerCase().includes(templateSearch.toLowerCase())).length > 0 && (
              <div>
                <h3 className="font-label-sm text-label-sm text-on-surface-variant mb-3">Interactive</h3>
                <div className="flex flex-col gap-1">
                  {[{ type: 'matrix', label: 'Matrix / Grid', icon: 'grid_on' },
                    { type: 'slider', label: 'Slider', icon: 'linear_scale' },
                    { type: 'counter', label: 'Counter (+/-)', icon: 'exposure' },
                    { type: 'tags', label: 'Tags / Chips', icon: 'label' },
                    { type: 'color_picker', label: 'Color Picker', icon: 'palette' },
                    { type: 'otp', label: 'OTP Input', icon: 'pin' }
                   ].filter(t => t.label.toLowerCase().includes(templateSearch.toLowerCase())).map(t => (
                    <DraggableLibraryItem key={t.type} type={t.type} label={t.label} icon={t.icon} onClick={() => addBlock(t.type, t.label, t.icon)} />
                  ))}
                </div>
              </div>
              )}

              {/* Ratings & Scales */}
              {[{ type: 'rating_stars', label: 'Star Rating', icon: 'star' },
                { type: 'emoji_rating', label: 'Emoji Rating', icon: 'mood' },
                { type: 'nps', label: 'NPS (0-10)', icon: 'speed' },
                { type: 'linear_scale', label: 'Linear Scale (1-5)', icon: 'linear_scale' },
                { type: 'yes_no', label: 'Yes/No Toggle', icon: 'toggle_on' }
               ].filter(t => t.label.toLowerCase().includes(templateSearch.toLowerCase())).length > 0 && (
              <div>
                <h3 className="font-label-sm text-label-sm text-on-surface-variant mb-3">Ratings & Scales</h3>
                <div className="flex flex-col gap-1">
                  {[{ type: 'rating_stars', label: 'Star Rating', icon: 'star' },
                    { type: 'emoji_rating', label: 'Emoji Rating', icon: 'mood' },
                    { type: 'nps', label: 'NPS (0-10)', icon: 'speed' },
                    { type: 'linear_scale', label: 'Linear Scale (1-5)', icon: 'linear_scale' },
                    { type: 'yes_no', label: 'Yes/No Toggle', icon: 'toggle_on' }
                   ].filter(t => t.label.toLowerCase().includes(templateSearch.toLowerCase())).map(t => (
                    <DraggableLibraryItem key={t.type} type={t.type} label={t.label} icon={t.icon} onClick={() => addBlock(t.type, t.label, t.icon)} />
                  ))}
                </div>
              </div>
              )}

              {/* Advanced & Legal */}
              {[{ type: 'credit_card', label: 'Credit Card Payment', icon: 'credit_card' },
                { type: 'fileupload', label: 'File Upload', icon: 'upload_file' },
                { type: 'signature', label: 'Signature Pad', icon: 'draw' },
                { type: 'terms', label: 'Terms & Conditions', icon: 'gavel' }
               ].filter(t => t.label.toLowerCase().includes(templateSearch.toLowerCase())).length > 0 && (
              <div>
                <h3 className="font-label-sm text-label-sm text-on-surface-variant mb-3">Advanced & Legal</h3>
                <div className="flex flex-col gap-1">
                  {[{ type: 'credit_card', label: 'Credit Card Payment', icon: 'credit_card' },
                    { type: 'fileupload', label: 'File Upload', icon: 'upload_file' },
                    { type: 'signature', label: 'Signature Pad', icon: 'draw' },
                    { type: 'terms', label: 'Terms & Conditions', icon: 'gavel' }
                   ].filter(t => t.label.toLowerCase().includes(templateSearch.toLowerCase())).map(t => (
                    <DraggableLibraryItem key={t.type} type={t.type} label={t.label} icon={t.icon} onClick={() => addBlock(t.type, t.label, t.icon)} />
                  ))}
                </div>
              </div>
              )}

              {/* Layout */}
              {[{ type: 'heading', label: 'Section Heading', icon: 'title' },
                { type: 'divider', label: 'Divider', icon: 'horizontal_rule' },
                { type: 'spacer', label: 'Spacer', icon: 'space_bar' }
               ].filter(t => t.label.toLowerCase().includes(templateSearch.toLowerCase())).length > 0 && (
              <div>
                <h3 className="font-label-sm text-label-sm text-on-surface-variant mb-3">Layout</h3>
                <div className="flex flex-col gap-1">
                  {[{ type: 'heading', label: 'Section Heading', icon: 'title' },
                    { type: 'divider', label: 'Divider', icon: 'horizontal_rule' },
                    { type: 'spacer', label: 'Spacer', icon: 'space_bar' }
                   ].filter(t => t.label.toLowerCase().includes(templateSearch.toLowerCase())).map(t => (
                    <DraggableLibraryItem key={t.type} type={t.type} label={t.label} icon={t.icon} onClick={() => addBlock(t.type, t.label, t.icon)} />
                  ))}
                </div>
              </div>
              )}

              {/* Smart AI Fields */}
              {[{ type: 'sentiment', label: 'AI Sentiment', icon: 'psychology', desc: 'Analysis text inputs' },
                { type: 'upload', label: 'Smart Upload', icon: 'document_scanner', desc: 'Auto-extract metadata' }
               ].filter(t => t.label.toLowerCase().includes(templateSearch.toLowerCase())).length > 0 && (
              <div>
                <h3 className="font-label-sm text-label-sm text-on-surface-variant mb-3 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-primary">auto_awesome</span>
                  Smart AI Fields
                </h3>
                <div className="space-y-2">
                  {[{ type: 'sentiment', label: 'AI Sentiment', icon: 'psychology', desc: 'Analysis text inputs' },
                    { type: 'upload', label: 'Smart Upload', icon: 'document_scanner', desc: 'Auto-extract metadata' }
                   ].filter(t => t.label.toLowerCase().includes(templateSearch.toLowerCase())).map(t => (
                    <DraggableLibraryItem key={t.type} type={t.type} label={t.label} icon={t.icon} desc={t.desc} onClick={() => addBlock(t.type, t.label, t.icon)} />
                  ))}
                </div>
              </div>
              )}

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
                        {visibleBlocks.length} fields &middot; {formMode === 'conversational' ? 'Conversational Flow' : `Classic Layout · Page ${currentPage} of ${totalPages}`}
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
                <div className="relative w-full h-12 flex items-center justify-center my-2">
                  <div className="absolute inset-0 flex justify-center"><div className="w-px h-full bg-gray-300"></div></div>
                  <DropZone index={0} />
                </div>

                {/* Dynamic Block Rendering */}
                  <SortableContext items={visibleBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                    {visibleBlocks.map((block, index) => {
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

                                  {/* Choice/Dropdown/Checkbox Options List */}
                                  {(block.type === 'choice' || block.type === 'dropdown' || block.type === 'checkbox') && (
                                    <div className="space-y-2 mt-2">
                                      {block.options?.map((opt, i) => (
                                        <div key={i} className="flex items-center justify-between group">
                                          <div className="flex items-center gap-2 flex-1">
                                            <span className="material-symbols-outlined text-gray-300 text-sm">
                                              {block.type === 'checkbox' ? 'check_box_outline_blank' : 'radio_button_unchecked'}
                                            </span>
                                            <input
                                              type="text"
                                              value={opt.label}
                                              onChange={(e) => {
                                                const newOpts = [...block.options];
                                                newOpts[i].label = e.target.value;
                                                updateBlockValue(block.id, 'options', newOpts);
                                              }}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                  e.preventDefault();
                                                  const newOpts = [...block.options];
                                                  newOpts.splice(i + 1, 0, { value: `option-${Date.now()}`, label: `Option ${newOpts.length + 1}` });
                                                  updateBlockValue(block.id, 'options', newOpts);
                                                }
                                              }}
                                              className="bg-transparent border-none text-gray-700 text-sm p-0 focus:ring-0 focus:border-b focus:border-primary focus:outline-none w-full"
                                            />
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (block.options.length > 1) {
                                                const newOpts = block.options.filter((_, idx) => idx !== i);
                                                updateBlockValue(block.id, 'options', newOpts);
                                              }
                                            }}
                                            className={`text-gray-300 hover:text-red-500 transition-colors ${block.options.length <= 1 ? 'invisible' : 'opacity-0 group-hover:opacity-100'}`}
                                            title="Remove Option"
                                          >
                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                          </button>
                                        </div>
                                      ))}
                                      <button
                                        onClick={() => {
                                          const newOpts = [...block.options, { value: `option-${Date.now()}`, label: `Option ${block.options.length + 1}` }];
                                          updateBlockValue(block.id, 'options', newOpts);
                                        }}
                                        className="text-primary text-xs font-semibold hover:underline mt-2 flex items-center gap-1"
                                      >
                                        <span className="material-symbols-outlined text-xs">add</span> Add Option
                                      </button>
                                    </div>
                                  )}

                                  {/* Matrix Rows & Columns Editor */}
                                  {block.type === 'matrix' && (
                                    <div className="mt-4 space-y-4">
                                      <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Rows (One per line)</label>
                                        <textarea
                                          value={(block.rows || ['Quality', 'Speed']).join('\n')}
                                          onChange={(e) => {
                                            const newRows = e.target.value.split('\n');
                                            updateBlockValue(block.id, 'rows', newRows);
                                          }}
                                          placeholder="Enter rows..."
                                          className="w-full mt-1 font-body-sm text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded p-2 resize-none h-20 focus:border-primary focus:outline-none focus:ring-0"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Columns (One per line)</label>
                                        <textarea
                                          value={(block.columns || ['Poor', 'Avg', 'Good']).join('\n')}
                                          onChange={(e) => {
                                            const newCols = e.target.value.split('\n');
                                            updateBlockValue(block.id, 'columns', newCols);
                                          }}
                                          placeholder="Enter columns..."
                                          className="w-full mt-1 font-body-sm text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded p-2 resize-none h-20 focus:border-primary focus:outline-none focus:ring-0"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* Slider Min/Max Editor */}
                                  {block.type === 'slider' && (
                                    <div className="mt-4 space-y-4">
                                      <div className="flex gap-4">
                                        <div className="flex-1">
                                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Min Value</label>
                                          <input
                                            type="number"
                                            value={block.min !== undefined ? block.min : 0}
                                            onChange={(e) => updateBlockValue(block.id, 'min', parseInt(e.target.value) || 0)}
                                            className="w-full mt-1 bg-gray-50 border border-gray-200 rounded p-2 text-sm focus:border-primary focus:outline-none"
                                          />
                                        </div>
                                        <div className="flex-1">
                                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Max Value</label>
                                          <input
                                            type="number"
                                            value={block.max !== undefined ? block.max : 100}
                                            onChange={(e) => updateBlockValue(block.id, 'max', parseInt(e.target.value) || 100)}
                                            className="w-full mt-1 bg-gray-50 border border-gray-200 rounded p-2 text-sm focus:border-primary focus:outline-none"
                                          />
                                        </div>
                                      </div>
                                      <div className="flex gap-4">
                                        <div className="flex-1">
                                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Min Label</label>
                                          <input
                                            type="text"
                                            value={block.minLabel || ''}
                                            onChange={(e) => updateBlockValue(block.id, 'minLabel', e.target.value)}
                                            placeholder="e.g. Min"
                                            className="w-full mt-1 bg-gray-50 border border-gray-200 rounded p-2 text-sm focus:border-primary focus:outline-none"
                                          />
                                        </div>
                                        <div className="flex-1">
                                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Max Label</label>
                                          <input
                                            type="text"
                                            value={block.maxLabel || ''}
                                            onChange={(e) => updateBlockValue(block.id, 'maxLabel', e.target.value)}
                                            placeholder="e.g. Max"
                                            className="w-full mt-1 bg-gray-50 border border-gray-200 rounded p-2 text-sm focus:border-primary focus:outline-none"
                                          />
                                        </div>
                                      </div>
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
                              {index < visibleBlocks.length - 1 && (
                                <div className="relative w-full h-12 flex items-center justify-center">
                                  <div className="absolute inset-0 flex justify-center"><div className="w-px h-full bg-gray-300"></div></div>
                                  <DropZone index={index + 1} />
                                </div>
                              )}
                            </div>
                          )}
                        </SortableBlock>
                      );
                    })}
                  </SortableContext>

                {/* End node */}
                <div className="relative w-full h-12 flex items-center justify-center my-2">
                  <div className="absolute inset-0 flex justify-center"><div className="w-px h-full bg-gray-300"></div></div>
                  {visibleBlocks.length > 0 && <DropZone index={visibleBlocks.length} />}
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
                            <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title}</h2>
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



                        {activeBlock.type === 'color_picker' && (() => {
                          const val = previewData[activeBlock.id] || '#000000';
                          const isValidHex = /^#[0-9A-F]{6}$/i.test(val);
                          const pickerColor = isValidHex ? val : '#000000';

                          return (
                            <div>
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title}</h2>
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
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title}</h2>
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
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title}</h2>
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
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title}</h2>
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
                              <h2 className="text-base font-bold text-gray-900 mb-4 leading-snug">{activeBlock.title}</h2>
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
                            <button className="flex-1 ml-4 h-8 bg-gray-900 text-white flex items-center justify-center font-bold text-xs tracking-wider uppercase rounded-sm hover:bg-black">
                              Submit
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
                        }}
                        className="flex-1 h-10 bg-gray-900 text-white flex items-center justify-center font-bold text-xs tracking-wider uppercase rounded-sm hover:bg-black transition-colors"
                      >
                        {currentPage < totalPages ? 'Next' : 'Submit'}
                      </button>
                    </div>
                  )}
                </div>
                </div>
              </div>
            </div>
          </aside>

        </div>

      </main>

      <DragOverlay>
        {activeDragItem ? (
          <div className="bg-white border-2 border-primary text-gray-900 rounded-sm p-3 flex items-center gap-2 shadow-xl opacity-90 scale-105 pointer-events-none min-w-[200px] z-50">
            <span className="material-symbols-outlined text-primary text-[18px]">{activeDragItem.icon}</span>
            <span className="text-xs font-bold tracking-wide">{activeDragItem.label}</span>
          </div>
        ) : null}
      </DragOverlay>

      </div>
    </DndContext>
  );
}
