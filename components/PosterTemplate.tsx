import React, { forwardRef, useState } from 'react';
import { IncidentData } from '../types';

interface PosterTemplateProps {
  data: IncidentData;
  originalImageSrc: string;
  mimeType?: string;
}

const PosterTemplate = forwardRef<HTMLDivElement, PosterTemplateProps>(({ data, originalImageSrc, mimeType }, ref) => {
  const isPdf = mimeType?.includes('pdf');
  const [detailsAlign, setDetailsAlign] = useState<'left' | 'right'>('right');
  const [rowSpacing, setRowSpacing] = useState<'tight' | 'normal' | 'loose'>('normal');

  const getSpacingClass = () => {
    switch (rowSpacing) {
      case 'tight': return 'py-1';
      case 'normal': return 'py-3';
      case 'loose': return 'py-5';
      default: return 'py-3';
    }
  };

  return (
    // Removed shadow, margin, and overflow-hidden from here to ensure clean capture. 
    // This div represents the exact paper surface.
    <div ref={ref} className="print-page w-[210mm] min-h-[297mm] bg-white text-[18px] border border-gray-300 relative flex flex-col group">
      
      {/* Controls - Hidden during Print and Image Generation */}
      <div 
        className="absolute top-2 right-2 flex flex-col gap-2 no-print opacity-0 group-hover:opacity-100 transition-opacity z-10 items-end"
        data-html2canvas-ignore="true"
      >
        {/* Alignment Controls */}
        <div className="flex gap-1 bg-white p-1 rounded border border-gray-300 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center px-1">Align</span>
            <button 
              onClick={() => setDetailsAlign('left')}
              className={`px-2 py-1 text-xs font-bold rounded ${detailsAlign === 'left' ? 'bg-barrick-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              L
            </button>
            <button 
              onClick={() => setDetailsAlign('right')}
              className={`px-2 py-1 text-xs font-bold rounded ${detailsAlign === 'right' ? 'bg-barrick-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              R
            </button>
        </div>

        {/* Height/Spacing Controls */}
        <div className="flex gap-1 bg-white p-1 rounded border border-gray-300 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center px-1">Height</span>
             <button 
              onClick={() => setRowSpacing('tight')}
              className={`px-2 py-1 text-xs font-bold rounded ${rowSpacing === 'tight' ? 'bg-barrick-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              S
            </button>
            <button 
              onClick={() => setRowSpacing('normal')}
              className={`px-2 py-1 text-xs font-bold rounded ${rowSpacing === 'normal' ? 'bg-barrick-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              M
            </button>
             <button 
              onClick={() => setRowSpacing('loose')}
              className={`px-2 py-1 text-xs font-bold rounded ${rowSpacing === 'loose' ? 'bg-barrick-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              L
            </button>
        </div>
      </div>

      {/* Top Header - BARRICK Logo area */}
      <div className="bg-white p-5 border-b-[6px] border-barrick-yellow">
        <h1 className="text-5xl font-bold text-slate-900 tracking-[0.2em] uppercase">BARRICK</h1>
      </div>

      {/* Warning Stripe - Simplified gradient for better html2canvas rendering */}
      <div 
        className="h-5 w-full border-b-2 border-black"
        style={{
            backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 10px, #FFC72C 10px, #FFC72C 20px)"
        }}
      ></div>

      {/* Internal Doc Warning */}
      <div className="text-center bg-white text-[#D71920] font-bold text-lg py-2 urdu-text border-b border-gray-300">
        ***** یہ دستاویزات اندرونی ہیں اور کمپنی سے باہر شیئر نہیں کی جانی چاہئیں۔ *****
      </div>

      {/* Title Bar */}
      <div className="bg-barrick-header text-white p-4 flex items-center border-b border-white">
        <h2 className="text-3xl font-bold w-full text-right urdu-text leading-relaxed pr-2">
          {data.title}
        </h2>
      </div>

      {/* Main Content Grid - Image Left, Info Right */}
      <div className="flex flex-col md:flex-row border-b border-gray-400">
        
        {/* Left Column: Image Area */}
        <div className="w-full md:w-6/12 bg-gray-50 flex flex-col justify-center items-center relative border-r border-gray-400 p-2">
          {isPdf ? (
             <div className="flex flex-col items-center justify-center h-[350px] w-full border border-gray-300 bg-white text-gray-400">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-2">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
               </svg>
               <span className="text-lg font-semibold">PDF Document Uploaded</span>
               <span className="text-base mt-1 text-center px-4">Image preview unavailable for PDF uploads.</span>
             </div>
          ) : (
             <img 
               src={originalImageSrc} 
               alt="Incident Scene" 
               className="object-contain max-h-[450px] w-full shadow-sm"
             />
          )}
          {data.image_caption && (
             <p className="text-base text-gray-700 mt-2 urdu-text w-full text-center px-2 font-medium">{data.image_caption}</p>
          )}
        </div>

        {/* Right Column: Data Fields */}
        <div className="w-full md:w-6/12 flex flex-col">
          <InfoRow label="آپریشن" value={data.operation} align={detailsAlign} spacing={getSpacingClass()} />
          <InfoRow label="شعبہ" value={data.department} align={detailsAlign} spacing={getSpacingClass()} />
          <InfoRow label="مقام" value={data.location} align={detailsAlign} spacing={getSpacingClass()} />
          <InfoRow label="کمپنی" value={data.company} align={detailsAlign} spacing={getSpacingClass()} />
          <InfoRow label="تاریخ" value={data.date} align={detailsAlign} spacing={getSpacingClass()} />
          <InfoRow label="وقت" value={data.time} align={detailsAlign} spacing={getSpacingClass()} />
          <InfoRow label="درجہ بندی" value={data.classification} highlight align={detailsAlign} spacing={getSpacingClass()} />
          <InfoRow label="مہلک خطرہ" value={data.fatal_risk} align={detailsAlign} spacing={getSpacingClass()} />
          <InfoRow label="شدت" value={data.severity} redText align={detailsAlign} spacing={getSpacingClass()} />
        </div>

      </div>

      {/* Summary Section */}
      <SectionHeader title="خلاصہ" />
      <div className="p-5 bg-white urdu-text text-right text-lg border-b border-gray-400 leading-[2.8rem]">
        {data.summary}
      </div>

      {/* How it happened Section */}
      <SectionHeader title="یہ کیسے ہوا؟ (ابتدائی تحقیقات)" />
      <div className="p-5 bg-white urdu-text text-right text-lg border-b border-gray-400 leading-[2.8rem]">
        {data.how_it_happened}
      </div>

      {/* Actions Section */}
      <SectionHeader title="اقدامات" bgColor="bg-barrick-header" textColor="text-white" />
      <div className="p-5 bg-[#F0F7FA] urdu-text text-right text-lg border-b border-barrick-header flex-grow leading-[2.8rem]">
         <div className="flex flex-col gap-3">
            {data.actions.split('\n').filter(l => l.trim()).map((line, index) => (
                <div key={index} className="flex gap-3 justify-start">
                     {/* Bullet Point */}
                    <span className="font-bold text-barrick-blue pt-2">•</span>
                     {/* Text content - strip existing bullets if AI adds them */}
                    <span className="leading-[2.8rem]">{line.replace(/^[\-\•\*\d\.]+\s*/, '').trim()}</span>
                </div>
            ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto bg-barrick-header text-white px-6 py-3 text-center text-sm uppercase font-bold tracking-wide flex justify-between items-center">
         <span>Barrick Mining Corporation - For Internal Use Only Do Not Share Externally</span>
         <span>1 OF 1</span>
      </div>
    </div>
  );
});

// Layout: [ Value (Left - Grows) ] | [ Label (Right - Fixed Width) ]
// Note: In RTL context (urdu-text), justify-start aligns to Right, justify-end aligns to Left.
const InfoRow = ({ 
  label, 
  value, 
  highlight = false, 
  redText = false, 
  align = 'right',
  spacing = 'py-3'
}: { 
  label: string, 
  value: string, 
  highlight?: boolean, 
  redText?: boolean,
  align?: 'left' | 'right',
  spacing?: string
}) => (
  <div className="flex border-b border-gray-300">
    {/* Value Column (Left Side) */}
    <div className={`flex-grow px-3 ${spacing} flex items-center urdu-text leading-9 border-r border-gray-200 
        ${align === 'left' ? 'text-left justify-end' : 'text-right justify-start'}
        ${highlight ? 'bg-[#79c09b] text-white font-bold' : 'bg-white'} 
        ${redText ? 'text-barrick-red font-bold' : (!highlight ? 'text-gray-900' : '')}
    `}>
      <span className="w-full text-[18px] break-words">{value}</span>
    </div>
    
    {/* Label Column (Right Side) */}
    <div className={`w-[35%] px-3 ${spacing} font-bold text-barrick-blue bg-[#EAF4F8] flex items-center urdu-text border-l-0
        ${align === 'left' ? 'text-left justify-end' : 'text-right justify-start'}
    `}>
      <span className="w-full text-[18px] break-words">{label}</span>
    </div>
  </div>
);

const SectionHeader = ({ title, bgColor = "bg-[#6D6E71]", textColor = "text-white" }: { title: string, bgColor?: string, textColor?: string }) => (
  <div className={`${bgColor} ${textColor} font-bold px-5 py-3 text-right border-b border-gray-400 urdu-text text-2xl`}>
    {title}
  </div>
);

export default PosterTemplate;