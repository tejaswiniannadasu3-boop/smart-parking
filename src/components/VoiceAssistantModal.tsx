import React, { useState, useEffect } from 'react';
import { speechAssistant, VoiceCommandResult } from '../services/speechAssistant';
import { soundEffects } from '../services/soundEffects';
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand: (result: VoiceCommandResult) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onExecuteCommand,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [feedback, setFeedback] = useState<string>(
    'Press the microphone button or pick a command below to begin voice interaction.'
  );
  const [commandHistory, setCommandHistory] = useState<VoiceCommandResult[]>([]);

  if (!isOpen) return null;

  const handleStartListening = () => {
    setIsListening(true);
    setTranscript('Listening for your voice command...');
    speechAssistant.startListening(
      (result) => {
        setIsListening(false);
        setTranscript(result.transcript);
        setFeedback(result.feedback);
        setCommandHistory((prev) => [result, ...prev]);
        onExecuteCommand(result);
      },
      (err) => {
        setIsListening(false);
        setTranscript('');
        setFeedback(
          'Could not capture voice audio. You can use the quick command shortcuts below.'
        );
      }
    );
  };

  const handleQuickCommand = (text: string) => {
    soundEffects.playVoiceChime();
    setTranscript(text);
    const result = speechAssistant.parseCommand(text);
    setFeedback(result.feedback);
    speechAssistant.speak(result.feedback);
    setCommandHistory((prev) => [result, ...prev]);
    onExecuteCommand(result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <Mic size={22} className="text-purple-200" />
            </div>
            <div>
              <h2 className="font-bold text-lg tracking-tight">SmartPark Voice Assistant</h2>
              <p className="text-xs text-purple-100">
                Hands-free voice recognition & spoken turn-by-turn guidance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Interactive Pulse Stage */}
        <div className="p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            {/* Animated Pulses */}
            {isListening && (
              <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping" />
            )}
            <button
              onClick={isListening ? () => speechAssistant.stopListening() : handleStartListening}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                isListening
                  ? 'bg-red-500 shadow-red-500/50 scale-105 text-white'
                  : 'bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/60'
              }`}
            >
              {isListening ? (
                <MicOff size={36} className="animate-pulse" />
              ) : (
                <Mic size={36} />
              )}
            </button>
          </div>

          <div className="space-y-1 max-w-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-purple-400">
              {isListening ? 'Awaiting Audio Speech...' : 'Voice Engine Ready'}
            </div>
            <div className="text-sm font-medium text-white italic min-h-[24px]">
              {transcript ? `"${transcript}"` : 'Tap mic to speak or click a command below'}
            </div>
            <p className="text-xs text-slate-400 mt-1">{feedback}</p>
          </div>
        </div>

        {/* Supported Commands Grid */}
        <div className="bg-slate-850 border-t border-slate-800 p-6 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <HelpCircle size={14} /> Quick Voice Command Shortcuts
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Find Nearest Slot', cmd: 'Find nearest slot' },
              { label: 'Recommend Zone', cmd: 'Recommend zone' },
              { label: 'Book Nearest Bay', cmd: 'Book slot' },
              { label: 'Show Parking Ticket', cmd: 'Show my ticket' },
              { label: 'Check Occupancy', cmd: 'Check live occupancy' },
              { label: 'Navigate to Bay', cmd: 'Navigate to my slot' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => handleQuickCommand(item.cmd)}
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-750 text-left text-xs font-medium text-slate-200 hover:text-white transition flex items-center justify-between group"
              >
                <span>{item.label}</span>
                <ChevronRight
                  size={14}
                  className="text-slate-500 group-hover:text-purple-400 transition"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
