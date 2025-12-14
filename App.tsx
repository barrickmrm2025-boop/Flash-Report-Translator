import React, { useState, useRef } from 'react';
import { extractAndTranslate } from './services/geminiService';
import PosterTemplate from './components/PosterTemplate';
import { IncidentData, AppState } from './types';
import html2canvas from 'html2canvas';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [data, setData] = useState<IncidentData | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [mimeType, setMimeType] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);

  // Helper to crop image using 0-1000 scale coordinates [ymin, xmin, ymax, xmax]
  const cropImage = (base64Str: string, box: number[]): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const [ymin, xmin, ymax, xmax] = box;
        const w = img.width;
        const h = img.height;
        
        // Convert 0-1000 to pixels
        const startX = (xmin / 1000) * w;
        const startY = (ymin / 1000) * h;
        const width = ((xmax - xmin) / 1000) * w;
        const height = ((ymax - ymin) / 1000) * h;

        // Safety check for valid dimensions
        if (width <= 0 || height <= 0) {
            resolve(base64Str);
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(base64Str); return; }

        ctx.drawImage(img, startX, startY, width, height, 0, 0, width, height);
        resolve(canvas.toDataURL());
      };
      img.onerror = () => resolve(base64Str);
      img.src = base64Str;
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
        setErrorMsg("Please upload an image file (JPG, PNG) or PDF.");
        return;
    }

    const currentMimeType = file.type;
    setMimeType(currentMimeType);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      // Initialize with full image/pdf
      setImageSrc(result);
      setAppState(AppState.PROCESSING);
      setErrorMsg('');

      try {
        // Strip base64 prefix for API (e.g., "data:image/jpeg;base64,")
        const base64Data = result.split(',')[1];
        const translatedData = await extractAndTranslate(base64Data, currentMimeType);
        
        // If it's an image and we have coordinates, crop it
        if (currentMimeType.startsWith('image/') && translatedData.box_2d && translatedData.box_2d.length === 4) {
            try {
                const cropped = await cropImage(result, translatedData.box_2d);
                setImageSrc(cropped);
            } catch (cropError) {
                console.warn("Cropping failed, using original", cropError);
            }
        }
        
        setData(translatedData);
        setAppState(AppState.RESULT);
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || "Failed to translate the poster. Please try again.");
        setAppState(AppState.ERROR);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    if (!posterRef.current) return;
    try {
      // Use html2canvas to render the element with high scale for clarity
      const canvas = await html2canvas(posterRef.current, {
        scale: 4, // Higher resolution (was 2)
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const link = document.createElement('a');
      link.download = `Barrick-Safety-Incident-Urdu-${new Date().toISOString().split('T')[0]}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();
    } catch (err) {
      console.error("Failed to generate image:", err);
      alert("Could not generate image. Please try the Print option.");
    }
  };

  const reset = () => {
    setAppState(AppState.UPLOAD);
    setData(null);
    setImageSrc('');
    setMimeType('');
    setErrorMsg('');
  };

  const handleSelectKey = async () => {
      if (window.aistudio) {
          try {
              await window.aistudio.openSelectKey();
              window.location.reload();
          } catch (e) {
              console.error(e);
          }
      }
  };


  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 print:bg-white">
      
      {/* Navbar / Header (Hidden in Print) */}
      <nav className="bg-barrick-header text-white p-4 shadow-md no-print sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-yellow-400 rounded-sm skew-x-12"></div>
            <h1 className="text-xl font-bold tracking-wide">Barrick Flash Report Translator <span className="text-xs opacity-75 font-normal ml-2">URDU</span></h1>
          </div>
          {appState === AppState.RESULT && (
            <div className="flex gap-2">
                 <button 
                  onClick={reset}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors text-white shadow-sm"
                >
                  Upload New
                </button>
                 <button 
                  onClick={handleDownloadImage}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-bold flex items-center gap-2 transition-colors text-white shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  Download JPG
                </button>
                <button 
                  onClick={handlePrint}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-sm font-bold flex items-center gap-2 transition-colors text-white shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                  </svg>
                  Save PDF
                </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-4 md:p-8 flex flex-col items-center justify-center min-h-[80vh] print:p-0 print:m-0 print:block">
        
        {/* Upload State */}
        {appState === AppState.UPLOAD && (
          <div className="max-w-xl w-full bg-white p-8 rounded-xl shadow-lg border-2 border-dashed border-slate-300 hover:border-barrick-blue transition-colors text-center no-print">
            <div className="mb-6 flex justify-center">
              <div className="bg-blue-50 p-4 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-barrick-blue">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Upload Safety Incident Poster</h2>
            <p className="text-gray-500 mb-6">Upload an image (JPG, PNG) or PDF of the safety report to translate it into Urdu.</p>
            
            <input 
              type="file" 
              accept="image/*,.pdf" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-barrick-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-all shadow-md active:scale-95"
            >
              Select File
            </button>
            <p className="mt-4 text-xs text-gray-400">Supported formats: JPG, PNG, PDF</p>
            <p className="text-xs text-amber-600 mt-2 font-semibold">Note: For image extraction, please upload an image file (JPG/PNG). PDFs may not display the incident scene.</p>
          </div>
        )}

        {/* Processing State */}
        {appState === AppState.PROCESSING && (
           <div className="text-center no-print">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-barrick-yellow mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-barrick-blue animate-pulse">Analyzing Document...</h2>
              <p className="text-gray-500 mt-2">Translating content to Urdu (Nastaliq)...</p>
           </div>
        )}

        {/* Result State */}
        {appState === AppState.RESULT && data && (
          <div className="w-full flex justify-center print:block print:w-full print:h-full">
            {/* Wrapper for shadow/centering on screen, NOT captured by export/print */}
            <div className="shadow-2xl print:shadow-none">
              <PosterTemplate ref={posterRef} data={data} originalImageSrc={imageSrc} mimeType={mimeType} />
            </div>
          </div>
        )}

        {/* Error State */}
        {appState === AppState.ERROR && (
           <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border-l-4 border-red-500 text-center no-print">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Translation Failed</h3>
              <p className="text-gray-600 mb-6">{errorMsg}</p>
              
              <div className="flex flex-col gap-3">
                  <button onClick={reset} className="w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300">
                    Try Again
                  </button>
                  {!process.env.API_KEY && (
                      <button onClick={handleSelectKey} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                        Select API Key
                      </button>
                  )}
              </div>
           </div>
        )}

        {/* Footer info (no print) */}
        <div className="mt-12 text-center text-xs text-gray-400 no-print">
          <p>Powered by Google Gemini 2.5 Flash</p>
          <p>Uses 'Noto Nastaliq Urdu' font for readability.</p>
        </div>

      </main>
    </div>
  );
};

export default App;