import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import QRCode from 'react-qr-code';
// Some versions/environments might require named import or have different export structures
const QRCodeComponent = typeof QRCode === 'function' ? QRCode : QRCode.default || QRCode;
import { 
  X, 
  Camera, 
  Flashlight, 
  RefreshCcw, 
  Copy, 
  Check, 
  Download, 
  Share2, 
  ShieldCheck,
  Info,
  Maximize2
} from 'lucide-react';
import { useQR } from '../context/QRContext';
import useStore from '../store/useStore';

export const QRPortal = () => {
  const { isScannerOpen, closeScanner, isGeneratorOpen, closeGenerator, handleScanSuccess } = useQR();

  return (
    <>
      <AnimatePresence>
        {isScannerOpen && <QRScannerModal key="scanner" onClose={closeScanner} onSuccess={handleScanSuccess} />}
      </AnimatePresence>
      <AnimatePresence>
        {isGeneratorOpen && <QRGeneratorModal key="generator" onClose={closeGenerator} />}
      </AnimatePresence>
    </>
  );
};

const QRScannerModal = ({ onClose, onSuccess }) => {
  const [error, setError] = useState(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [cameraPermission, setCameraPermission] = useState('pending'); // pending, granted, denied
  const scannerRef = useRef(null);
  const html5QrCode = useRef(null);

  useEffect(() => {
    let isMounted = true;
    
    const startScanner = async () => {
      // Ensure any existing instance is cleaned up first
      if (html5QrCode.current) {
        try {
          if (html5QrCode.current.isScanning) {
            await html5QrCode.current.stop();
          }
          html5QrCode.current.clear();
        } catch (e) {
          console.warn("Cleanup warning:", e);
        }
      }

      try {
        html5QrCode.current = new Html5Qrcode("reader");
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        
        if (!isMounted) return;

        await html5QrCode.current.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            if (isMounted) {
              onSuccess(decodedText);
              stopScanner();
            }
          },
          (errorMessage) => {
            // silent fail for frame scans
          }
        );
        
        if (isMounted) setCameraPermission('granted');
      } catch (err) {
        console.error("Scanner Error:", err);
        if (isMounted) {
          setError("Unable to access camera. Please check permissions.");
          setCameraPermission('denied');
        }
      }
    };

    // Slight delay to ensure the DOM element "reader" is ready
    const timer = setTimeout(startScanner, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      stopScanner();
    };
  }, []);

  const stopScanner = async () => {
    if (html5QrCode.current && html5QrCode.current.isScanning) {
      try {
        await html5QrCode.current.stop();
        html5QrCode.current.clear();
      } catch (err) {
        console.error("Stop error:", err);
      }
    }
  };

  const toggleFlash = async () => {
    if (html5QrCode.current && html5QrCode.current.isScanning) {
      try {
        const track = html5QrCode.current.getVideoTrack();
        const capabilities = track.getCapabilities();
        if (capabilities.torch) {
          await track.applyConstraints({
            advanced: [{ torch: !isFlashOn }]
          });
          setIsFlashOn(!isFlashOn);
        } else {
          alert("Flashlight not supported on this device.");
        }
      } catch (err) {
        console.error("Flash error:", err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 lg:p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full h-full lg:h-auto lg:max-w-md bg-white lg:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-8 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
                 <Camera size={20} strokeWidth={2.5} />
              </div>
              <div>
                 <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">Scan & Pay</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Secure UPI Payment</p>
              </div>
           </div>
           <button onClick={onClose} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
              <X size={20} />
           </button>
        </div>

        {/* Scanner Body */}
        <div className="relative flex-1 bg-black flex flex-col items-center justify-center overflow-hidden">
           {cameraPermission === 'denied' ? (
             <div className="p-10 text-center space-y-6">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto">
                   <Info size={32} />
                </div>
                <div>
                   <h4 className="text-lg font-black text-white">Camera Access Denied</h4>
                   <p className="text-slate-400 text-sm mt-2">Please enable camera permissions in your browser settings to scan QR codes.</p>
                </div>
                <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white text-slate-900 rounded-xl font-black text-[11px] uppercase tracking-widest">Retry Permission</button>
             </div>
           ) : (
             <>
                <div id="reader" className="w-full h-full overflow-hidden"></div>
                
                {/* Scanner Overlay UI */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                   {/* Scanning Frame */}
                   <div className="relative w-64 h-64 border-2 border-white/20 rounded-[2rem]">
                      <motion.div 
                        animate={{ 
                          top: ["0%", "100%", "0%"],
                          opacity: [0.2, 0.8, 0.2]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-0.5 bg-primary-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]"
                      />
                      
                      {/* Corners */}
                      <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary-500 rounded-tl-xl" />
                      <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary-500 rounded-tr-xl" />
                      <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary-500 rounded-bl-xl" />
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary-500 rounded-br-xl" />
                   </div>
                   
                   <p className="mt-10 text-white/60 text-[10px] font-black uppercase tracking-[0.3em] bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm border border-white/5">
                      Align QR inside frame
                   </p>
                </div>

                {/* Scanner Controls */}
                <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-6 px-10">
                   <button 
                    onClick={toggleFlash}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isFlashOn ? 'bg-primary-600 text-white' : 'bg-white/10 text-white backdrop-blur-md border border-white/10'}`}
                   >
                      <Flashlight size={24} />
                   </button>
                   <button 
                    className="w-14 h-14 bg-white/10 text-white backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center"
                   >
                      <RefreshCcw size={24} />
                   </button>
                </div>
             </>
           )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50 flex items-center justify-center gap-3">
           <ShieldCheck size={16} className="text-emerald-500" />
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PCI DSS Secure Scan • Finova Bank</span>
        </div>
      </motion.div>
    </div>
  );
};

const QRGeneratorModal = ({ onClose }) => {
  const [isCopied, setIsCopied] = useState(false);
  const { user, activeAccount } = useStore();
  const upiId = activeAccount?.upi_id || `${user?.email?.split('@')[0] || 'user'}@finova`;
  const displayName = user?.full_name || 'Finova Customer';
  const upiPayload = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(displayName)}&cu=INR`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(upiId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 50 }}
        className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 flex items-center justify-between border-b border-slate-50">
           <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">My Payment QR</h3>
           <button onClick={onClose} className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
              <X size={16} />
           </button>
        </div>

        <div className="p-10 space-y-10 flex flex-col items-center">
           {/* Profile Mini Card */}
           <div className="flex items-center gap-4 w-full">
              <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white text-xl font-black">{displayName.substring(0, 2).toUpperCase()}</div>
              <div>
                 <h4 className="font-black text-slate-900 text-lg leading-none">{displayName}</h4>
                 <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">{activeAccount?.account_type || 'Personal'} Account - Finova Bank</p>
              </div>
           </div>

           {/* QR Code Frame */}
           <div className="relative p-6 bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-50 flex items-center justify-center">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary-100 rounded-tl-xl -translate-x-2 -translate-y-2" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary-100 rounded-tr-xl translate-x-2 -translate-y-2" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary-100 rounded-bl-xl -translate-x-2 translate-y-2" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary-100 rounded-br-xl translate-x-2 translate-y-2" />
              
              <div className="bg-white p-2">
                 <QRCodeComponent 
                   value={upiPayload} 
                   size={200} 
                   style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                   viewBox={`0 0 256 256`}
                   fgColor="#0f172a"
                 />
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-10 h-10 bg-white rounded-xl shadow-lg border border-slate-50 flex items-center justify-center text-primary-600 font-black text-xs">V</div>
              </div>
           </div>

           {/* UPI ID Info */}
           <div className="w-full space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">UPI ID</p>
                    <p className="text-[13px] font-black text-slate-900">{upiId}</p>
                 </div>
                 <button 
                  onClick={copyToClipboard}
                  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary-600 transition-colors"
                 >
                    {isCopied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                 </button>
              </div>
              
              <div className="flex gap-3">
                 <button className="flex-1 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2.5">
                    <Download size={16} /> Download
                 </button>
                 <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-primary-600 transition-all flex items-center justify-center gap-2.5">
                    <Share2 size={16} /> Share
                 </button>
              </div>
           </div>
        </div>

        <div className="p-6 bg-slate-50 flex items-center justify-center gap-2">
           <ShieldCheck size={14} className="text-emerald-500" />
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Verified Payment QR • Finova Secure</span>
        </div>
      </motion.div>
    </div>
  );
};
