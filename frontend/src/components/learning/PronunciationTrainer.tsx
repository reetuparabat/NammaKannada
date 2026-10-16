'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Mic, MicOff, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface PronunciationTrainerProps {
  kannadaText: string;
  transliteration?: string | null;
}

// Global typing for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

export function PronunciationTrainer({
  kannadaText,
  transliteration,
}: PronunciationTrainerProps) {
  const [speed, setSpeed] = useState<number>(0.85);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [userTranscript, setUserTranscript] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [micSupported, setMicSupported] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Initialize Speech Recognition support check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setMicSupported(false);
      }
    }
  }, []);

  // Text-to-Speech handler
  const handleSpeak = (playbackRate: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(kannadaText);
    utterance.lang = 'kn-IN';
    utterance.rate = playbackRate;

    setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  // Helper to calculate string similarity (Levenshtein based or token overlap)
  const calculateSimilarity = (spoken: string, targetKannada: string, targetTranslit?: string | null): number => {
    const cleanSpoken = spoken.toLowerCase().replace(/[^\w\s\u0C80-\u0CFF]/gi, '').trim();
    const cleanTargetK = targetKannada.replace(/[^\u0C80-\u0CFF]/gi, '').trim();
    const cleanTargetT = (targetTranslit || '').toLowerCase().replace(/[^\w\s]/gi, '').trim();

    if (!cleanSpoken) return 0;

    // Check direct substring
    if (cleanTargetK && cleanSpoken.includes(cleanTargetK)) return 100;
    if (cleanTargetT && cleanSpoken.includes(cleanTargetT)) return 95;

    // Token overlap comparison
    const spokenTokens = cleanSpoken.split(/\s+/);
    const targetTokens = cleanTargetT.split(/\s+/);

    if (targetTokens.length === 0) return 50;

    let matchCount = 0;
    for (const t of targetTokens) {
      if (t.length > 2 && spokenTokens.some((s) => s.includes(t) || t.includes(s))) {
        matchCount++;
      }
    }

    const ratio = matchCount / targetTokens.length;
    return Math.min(100, Math.max(35, Math.round(ratio * 100)));
  };

  // Start Mic Listening
  const handleStartListening = () => {
    setErrorMessage(null);
    setUserTranscript(null);
    setScore(null);
    setFeedback(null);

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'kn-IN'; // Try Kannada recognition first
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0]?.[0]?.transcript || '';
        setUserTranscript(transcript);

        const calculatedScore = calculateSimilarity(transcript, kannadaText, transliteration);
        setScore(calculatedScore);

        if (calculatedScore >= 75) {
          setFeedback('🌟 ಅದ್ಭುತ! (Adbhutha! Excellent pronunciation!)');
        } else if (calculatedScore >= 45) {
          setFeedback('👍 ಚೆನ್ನಾಗಿದೆ! (Chennaagide! Good effort, keep practising!)');
        } else {
          setFeedback('💡 ಸ್ವಲ್ಪ ಪ್ರಯತ್ನಿಸಿ (Swalpa prayatnisi — Try speaking a bit slower and clearer!)');
        }
      };

      recognition.onerror = (e: { error: string }) => {
        setIsListening(false);
        if (e.error === 'not-allowed') {
          setErrorMessage('Microphone access denied. Please allow microphone permissions in your browser.');
        } else if (e.error === 'no-speech') {
          setErrorMessage('No speech was detected. Please click the mic and try speaking again.');
        } else {
          setErrorMessage(`Microphone error (${e.error}). Try again.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsListening(false);
      setErrorMessage('Could not access microphone.');
      console.error(err);
    }
  };

  // Stop Mic Listening
  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm transition hover:border-slate-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
              <Sparkles className="h-3 w-3" />
              Pronunciation Coach
            </span>
            <span className="text-xs text-slate-400">Kannada Phonetics & Voice Practice</span>
          </div>
          <p className="mt-1 text-sm text-slate-300">
            Listen at normal or slow speed, then use your microphone to test your speaking accuracy.
          </p>
        </div>

        {/* Audio Speed Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSpeed(0.85);
              handleSpeak(0.85);
            }}
            disabled={isPlaying}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
              speed === 0.85 && isPlaying
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
            title="Listen at Normal Speed (1x)"
          >
            <Volume2 className="h-4 w-4 text-amber-400" />
            <span>Normal (1x)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSpeed(0.65);
              handleSpeak(0.65);
            }}
            disabled={isPlaying}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
              speed === 0.65 && isPlaying
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
            title="Listen at Slower Speed (0.75x) for Clear Articulation"
          >
            <Volume2 className="h-4 w-4 text-amber-400" />
            <span>Slow (0.75x)</span>
          </button>
        </div>
      </div>

      {/* Syllable Breakdown Helper */}
      {transliteration && (
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/40 p-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Phonetic Syllables:
          </span>
          <p className="mt-0.5 font-mono text-sm tracking-wide text-amber-300">
            {transliteration.split(' ').map((word) => word.split(/(?=[aeiouy])/i).join(' · ')).join('  |  ')}
          </p>
        </div>
      )}

      {/* Mic Recording Assessment */}
      <div className="mt-4 border-t border-slate-800 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {isListening ? (
              <button
                type="button"
                onClick={handleStopListening}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white animate-pulse shadow-lg shadow-red-500/20"
              >
                <MicOff className="h-4 w-4" />
                <span>Listening... Click to finish</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartListening}
                disabled={!micSupported}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400 transition shadow-md shadow-amber-500/20 disabled:opacity-50"
              >
                <Mic className="h-4 w-4" />
                <span>{userTranscript ? 'Try Speaking Again' : 'Practice Speaking (Mic)'}</span>
              </button>
            )}

            {isListening && (
              <span className="text-xs text-amber-400 animate-pulse">
                Say: &quot;{transliteration || kannadaText}&quot;
              </span>
            )}
          </div>

          {score !== null && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Accuracy:</span>
              <span
                className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                  score >= 75
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : score >= 45
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {score}%
              </span>
            </div>
          )}
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-slate-700 bg-slate-800/80 p-3 text-xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-200">{feedback}</p>
              {userTranscript && (
                <p className="mt-1 text-slate-400">
                  Detected voice: &quot;<span className="text-slate-200">{userTranscript}</span>&quot;
                </p>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
