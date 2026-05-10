import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const QRContext = createContext();

export const QRProvider = ({ children }) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const navigate = useNavigate();

  const openScanner = () => {
    setIsScannerOpen(true);
    setScannedData(null);
  };

  const closeScanner = () => setIsScannerOpen(false);

  const openGenerator = () => setIsGeneratorOpen(true);
  const closeGenerator = () => setIsGeneratorOpen(false);

  const handleScanSuccess = (data) => {
    console.log("QR Scanned successfully:", data);
    setScannedData(data);
    setIsScannerOpen(false);
    
    // Logic to parse UPI URL and navigate to Payment Confirmation
    // upi://pay?pa=alexlee@vertex&pn=Alex Lee
    if (data.startsWith('upi://pay')) {
      const params = new URLSearchParams(data.split('?')[1]);
      const receiver = {
        pa: params.get('pa'),
        pn: params.get('pn'),
        am: params.get('am') || '',
        cu: params.get('cu') || 'INR'
      };
      
      // Navigate to payments with pre-filled data
      navigate('/app/payments', { state: { flow: 'scan', receiver } });
    } else {
      // Handle generic QR or show error
      alert("Invalid Banking QR. Please scan a valid UPI QR code.");
    }
  };

  return (
    <QRContext.Provider value={{ 
      isScannerOpen, 
      openScanner, 
      closeScanner,
      isGeneratorOpen,
      openGenerator,
      closeGenerator,
      handleScanSuccess,
      scannedData
    }}>
      {children}
    </QRContext.Provider>
  );
};

export const useQR = () => {
  const context = useContext(QRContext);
  if (!context) {
    throw new Error('useQR must be used within a QRProvider');
  }
  return context;
};
