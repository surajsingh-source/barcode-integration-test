import { useState, useCallback } from 'react';
import WelcomeScreen from './WelcomeScreen';
import InstructionsScreen from './InstructionsScreen';
import LibraryTransitionScreen from './LibraryTransitionScreen';
import ScanScreen from './ScanScreen';
import ResultsScreen from './ResultsScreen';
import SendResultsModal from './SendResultsModal';
import { getDeviceInfo } from './deviceInfo';

const TOTAL_LIBRARIES = 5;
const TOTAL_BARCODES  = 5;

export default function App() {
  // screen: 'welcome' | 'instructions' | 'transition' | 'scanning' | 'results'
  const [screen,        setScreen]        = useState('welcome');
  const [tester,        setTester]        = useState(null);
  const [deviceInfo]                      = useState(() => getDeviceInfo());
  const [libIndex,      setLibIndex]      = useState(0);
  const [barcodeIndex,  setBarcodeIndex]  = useState(0);
  const [results,       setResults]       = useState([]);
  const [showSendModal, setShowSendModal] = useState(false);

  const handleStart = useCallback((info) => {
    setTester(info);
    setScreen('instructions');
  }, []);

  const handleBegin = useCallback(() => {
    setLibIndex(0);
    setBarcodeIndex(0);
    setResults([]);
    setScreen('transition'); // show first library card
  }, []);

  const handleTransitionContinue = useCallback(() => {
    setScreen('scanning');
  }, []);

  const handleScanComplete = useCallback((scanResult) => {
    const enriched = {
      ...scanResult,
      testerName: tester?.name,
      company:    tester?.company,
    };

    setResults(prev => [...prev, enriched]);

    const nextBc = barcodeIndex + 1;
    if (nextBc < TOTAL_BARCODES) {
      setBarcodeIndex(nextBc);
    } else {
      setBarcodeIndex(0);
      const nextLib = libIndex + 1;
      if (nextLib < TOTAL_LIBRARIES) {
        setLibIndex(nextLib);
        setScreen('transition');
      } else {
        setScreen('results');
      }
    }
  }, [tester, libIndex, barcodeIndex]);

  return (
    <>
      {screen === 'welcome' && (
        <WelcomeScreen onStart={handleStart} />
      )}

      {screen === 'instructions' && (
        <InstructionsScreen
          tester={tester}
          deviceInfo={deviceInfo}
          onBegin={handleBegin}
        />
      )}

      {screen === 'transition' && (
        <LibraryTransitionScreen
          libIndex={libIndex}
          onContinue={handleTransitionContinue}
        />
      )}

      {screen === 'scanning' && (
        <ScanScreen
          key={`lib-${libIndex}-bc-${barcodeIndex}`}
          libIndex={libIndex}
          barcodeIndex={barcodeIndex}
          onScanComplete={handleScanComplete}
        />
      )}

      {screen === 'results' && (
        <ResultsScreen
          results={results}
          tester={tester}
          deviceInfo={deviceInfo}
          onSendResults={() => setShowSendModal(true)}
        />
      )}

      {showSendModal && (
        <SendResultsModal
          results={results}
          tester={tester}
          deviceInfo={deviceInfo}
          onClose={() => setShowSendModal(false)}
        />
      )}
    </>
  );
}
