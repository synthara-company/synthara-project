import React, { useState, useEffect } from 'react';
import { KeyRound } from 'lucide-react';

const VoiceAssistant = () => {
  const [isOptionKeyPressed, setIsOptionKeyPressed] = useState(false);

  // Function to say "Hi" when Option key is pressed
  const sayHi = () => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance('Hi');
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      speechSynthesis.speak(utterance);
    } else {
      console.error('Speech synthesis not supported in this browser');
    }
  };

  // Handle Option key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Option key (Alt key)
      if (e.altKey && !isOptionKeyPressed) {
        setIsOptionKeyPressed(true);
        sayHi(); // Say "Hi" when Option key is pressed
      }
    };

    const handleKeyUp = (e) => {
      // Check if the Option key (Alt key) was released
      if (!e.altKey) {
        setIsOptionKeyPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOptionKeyPressed]);

  return (
    <>
      {isOptionKeyPressed ? (
        // Show voice assistant when Option key is pressed
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white text-black font-bold text-3xl uppercase tracking-widest py-3 px-6 rounded-none shadow-lg border-2 border-black transform hover:scale-105 transition-all duration-200">
            Hi
          </div>
        </div>
      ) : (
        // Show just a small indicator when Option key is not pressed
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-white rounded-none p-2 shadow-md border-2 border-black flex items-center gap-2 text-xs text-black font-bold">
            <KeyRound size={16} />
            <span>Press Option key for Voice Assistant</span>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceAssistant;
