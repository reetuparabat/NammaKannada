'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  ArrowLeftRight,
  Volume2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Loader2,
  Languages,
  Zap,
} from 'lucide-react';
import { translateVoiceText, TranslationResponse } from '@/lib/api';

type LanguageCode = 'en' | 'kn';

interface SpeechRecognitionEvent extends Event {
  resultIndex?: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal?: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives?: number;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

export function VoiceTranslator() {
  const [sourceLang, setSourceLang] = useState<LanguageCode>('en');
  const [targetLang, setTargetLang] = useState<LanguageCode>('kn');

  const [inputText, setInputText] = useState<string>('');
  const [translatedResult, setTranslatedResult] = useState<TranslationResponse | null>(null);

  const [status, setStatus] = useState<
    | 'idle'
    | 'requesting_permission'
    | 'listening'
    | 'processing'
    | 'translating'
    | 'completed'
    | 'stopped'
    | 'permission_denied'
    | 'unsupported'
    | 'error'
  >('idle');

  const [statusMessage, setStatusMessage] = useState<string>('Ready to speak or type');
  const [copied, setCopied] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [ttsNotice, setTtsNotice] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [autoTranslate, setAutoTranslate] = useState<boolean>(true);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isListeningRef = useRef<boolean>(false);
  const finalTranscriptRef = useRef<string>('');
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check Web Speech API availability
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setSpeechSupported(false);
      }
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore
        }
      }
    };
  }, []);

  // Clear silence detection timer
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  // Swap language direction
  const handleSwapLanguages = () => {
    if (isListeningRef.current && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }
    clearSilenceTimer();

    const newSource = targetLang;
    const newTarget = sourceLang;
    setSourceLang(newSource);
    setTargetLang(newTarget);

    if (translatedResult?.translated_text) {
      setInputText(translatedResult.translated_text);
      finalTranscriptRef.current = translatedResult.translated_text;
      setTranslatedResult(null);
    } else {
      setInputText('');
      finalTranscriptRef.current = '';
      setTranslatedResult(null);
    }

    setStatus('idle');
    setStatusMessage('Language direction swapped. Ready to speak or type.');
    setTtsNotice(null);
  };

  // Trigger Translation
  const handleTranslate = useCallback(async (textToTranslate?: string) => {
    const text = (textToTranslate !== undefined ? textToTranslate : inputText).trim();
    if (!text) {
      setStatus('error');
      setStatusMessage('Please speak or type some text before translating.');
      return;
    }

    setStatus('translating');
    setStatusMessage('Translating with NammaKannada translation engine...');
    setTtsNotice(null);

    try {
      const response = await translateVoiceText(text, sourceLang, targetLang);
      setTranslatedResult(response);
      setStatus('completed');
      setStatusMessage('Translation completed successfully.');
    } catch (err: unknown) {
      setStatus('error');
      const errorMsg =
        err instanceof Error ? err.message : 'Translation request failed. Please check your connection.';
      setStatusMessage(`Translation failed: ${errorMsg}`);
    }
  }, [inputText, sourceLang, targetLang]);

  // Reset silence timer to auto-stop recognition smoothly after speech pause
  const resetSilenceTimer = useCallback((currentCompleteText: string) => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      if (isListeningRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
      if (autoTranslate && currentCompleteText.trim()) {
        handleTranslate(currentCompleteText.trim());
      }
    }, 2400);
  }, [clearSilenceTimer, autoTranslate, handleTranslate]);

  // Start Speech Recognition (Optimized continuous stream with smart interim buffering)
  const startRecording = useCallback(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus('unsupported');
      setStatusMessage('Speech recognition is not supported in this browser. Please use Chrome, Edge, or type manually.');
      return;
    }

    // Stop existing instance safely
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore
      }
      clearSilenceTimer();
    }

    try {
      setStatus('requesting_permission');
      setStatusMessage('Requesting microphone access...');

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      if ('maxAlternatives' in recognition) {
        recognition.maxAlternatives = 1;
      }
      recognition.lang = sourceLang === 'kn' ? 'kn-IN' : 'en-IN';

      finalTranscriptRef.current = inputText.trim();

      recognition.onstart = () => {
        isListeningRef.current = true;
        setStatus('listening');
        setStatusMessage(
          sourceLang === 'kn'
            ? 'Listening... Speak in Kannada (ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ)'
            : 'Listening... Speak in English'
        );
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimChunk = '';
        let newlyFinalizedChunk = '';

        const startIdx = event.resultIndex || 0;
        for (let i = startIdx; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript;
          if (result.isFinal) {
            newlyFinalizedChunk += (newlyFinalizedChunk ? ' ' : '') + text.trim();
          } else {
            interimChunk += text;
          }
        }

        if (newlyFinalizedChunk) {
          finalTranscriptRef.current = (
            finalTranscriptRef.current
              ? `${finalTranscriptRef.current} ${newlyFinalizedChunk}`
              : newlyFinalizedChunk
          ).trim();
        }

        const fullDisplay = (
          finalTranscriptRef.current +
          (interimChunk ? (finalTranscriptRef.current ? ' ' : '') + interimChunk : '')
        ).trim();

        if (fullDisplay) {
          setInputText(fullDisplay);
          setStatus('listening');
          resetSilenceTimer(fullDisplay);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        isListeningRef.current = false;
        clearSilenceTimer();

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setStatus('permission_denied');
          setStatusMessage(
            'Microphone access denied. Please click the lock icon in your address bar and allow microphone access.'
          );
        } else if (event.error === 'no-speech') {
          setStatus('stopped');
          setStatusMessage('No speech detected. Tap the microphone and try speaking again.');
        } else if (event.error === 'audio-capture') {
          setStatus('error');
          setStatusMessage('No microphone detected. Please connect an audio input device.');
        } else if (event.error === 'language-not-supported') {
          setStatus('error');
          setStatusMessage(
            sourceLang === 'kn'
              ? 'Kannada speech recognition is not supported in this browser version. You can type Kannada or switch to English input.'
              : 'English speech recognition is not supported in this browser.'
          );
        } else if (event.error !== 'aborted') {
          setStatus('error');
          setStatusMessage(`Speech recognition: ${event.error}. You can also type text directly.`);
        }
      };

      recognition.onend = () => {
        isListeningRef.current = false;
        clearSilenceTimer();
        setStatus((prev) => {
          if (prev === 'listening' || prev === 'processing') {
            return 'stopped';
          }
          return prev;
        });
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      isListeningRef.current = false;
      setStatus('error');
      setStatusMessage('Could not initialize microphone. Please check your browser permissions.');
    }
  }, [sourceLang, inputText, clearSilenceTimer, resetSilenceTimer]);

  // Stop Recording
  const stopRecording = useCallback(() => {
    clearSilenceTimer();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }
    isListeningRef.current = false;
    setStatus('stopped');
    setStatusMessage('Recording stopped. Review your text or click Translate.');

    if (autoTranslate && inputText.trim()) {
      handleTranslate(inputText.trim());
    }
  }, [clearSilenceTimer, autoTranslate, inputText, handleTranslate]);

  // Copy to clipboard
  const handleCopy = async () => {
    if (!translatedResult?.translated_text) return;
    try {
      await navigator.clipboard.writeText(translatedResult.translated_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Text-to-Speech Playback
  const handlePlayTTS = () => {
    if (!translatedResult?.translated_text || typeof window === 'undefined') return;

    if (!('speechSynthesis' in window)) {
      setTtsNotice('Text-to-speech is not supported by your current browser.');
      return;
    }

    window.speechSynthesis.cancel();
    setTtsNotice(null);

    const utterance = new SpeechSynthesisUtterance(translatedResult.translated_text);
    const targetLocale = targetLang === 'kn' ? 'kn-IN' : 'en-IN';
    utterance.lang = targetLocale;
    utterance.rate = targetLang === 'kn' ? 0.85 : 0.95;

    // Check available voices
    const voices = window.speechSynthesis.getVoices();
    const hasMatchingVoice = voices.some(
      (v) => v.lang.toLowerCase() === targetLocale.toLowerCase() || v.lang.startsWith(targetLang)
    );

    if (targetLang === 'kn' && !hasMatchingVoice && voices.length > 0) {
      setTtsNotice(
        'Note: A native Kannada system voice is not installed on this OS. Standard browser voice synthesis will attempt playback.'
      );
    }

    setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setTtsNotice('Audio playback could not be completed by the system voice synthesizer.');
    };

    window.speechSynthesis.speak(utterance);
  };

  // Keyboard shortcut Ctrl+Enter to translate
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleTranslate();
    }
  };

  // Example starter phrases
  const examplePhrases =
    sourceLang === 'en'
      ? [
          'How are you?',
          'Where is the bus stop?',
          'What is the auto fare to Majestic?',
          'Please help me find the doctor.',
          'How much does one kilogram of tomatoes cost?',
        ]
      : [
          'ನೀವು ಹೇಗಿದ್ದೀರಿ?',
          'ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?',
          'ಮೆಜೆಸ್ಟಿಕ್ ತನಕ ಆಟೋ ಬಾಡಿಗೆ ಎಷ್ಟು?',
          'ದಯವಿಟ್ಟು ನನಗೆ ಸಹಾಯ ಮಾಡಿ.',
          'ಒಂದು ಕಿಲೋ ಟೊಮೇಟೊ ಬೆಲೆ ಎಷ್ಟು?',
        ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* 1. Main Translator Container: Background #FFFFFF, Border 1px solid #E2E8F0, rounded-2xl/3xl, subtle shadow */}
      <div className="rounded-2xl lg:rounded-3xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm dark:shadow-2xl overflow-hidden transition-colors">
        {/* Top Language Bar Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-800/80 bg-[#F8FAFC] dark:bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
          {/* Language Switch Controls */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            {/* Source Language Badge */}
            <div className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-slate-700/60 shadow-xs flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-400" />
              <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">Input:</span>
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                {sourceLang === 'en' ? 'English (EN)' : 'ಕನ್ನಡ • Kannada (KN)'}
              </span>
            </div>

            {/* Swap Button */}
            <button
              type="button"
              onClick={handleSwapLanguages}
              aria-label="Swap translation direction"
              title="Swap translation direction"
              className="group p-2 sm:px-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-semibold shadow-xs"
            >
              <ArrowLeftRight className="h-3.5 w-3.5 transition-transform group-hover:rotate-180 duration-300" />
              <span>Swap Direction</span>
            </button>

            {/* Target Language Badge */}
            <div className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-slate-700/60 shadow-xs flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">Output:</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {targetLang === 'kn' ? 'ಕನ್ನಡ • Kannada (KN)' : 'English (EN)'}
              </span>
            </div>
          </div>

          {/* Voice Auto Mode Toggle */}
          <button
            type="button"
            onClick={() => setAutoTranslate(!autoTranslate)}
            aria-label="Toggle continuous voice auto mode"
            title="Auto-translates when you pause speaking"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              autoTranslate
                ? 'border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300'
                : 'border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Zap className={`h-3.5 w-3.5 ${autoTranslate ? 'text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400' : 'text-slate-400 dark:text-slate-500'}`} />
            <span>Voice Auto</span>
            <span
              className={`ml-1 px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${
                autoTranslate ? 'bg-amber-200/60 dark:bg-amber-400/20 text-amber-800 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {autoTranslate ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        {/* 2. Input and Output Panels: Background #FFFFFF, subtle borders, clear separation, 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#E2E8F0] dark:divide-slate-800/80 bg-white dark:bg-slate-900">
          {/* Left Canvas: Recognized Speech / Editable Input */}
          <div className="p-5 sm:p-6 flex flex-col justify-between min-h-[360px] bg-white dark:bg-slate-900/50">
            {/* Header row */}
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#172554] dark:text-slate-300">
                  {sourceLang === 'en' ? 'English Speech & Text' : 'ಕನ್ನಡ ಮಾತು ಮತ್ತು ಪಠ್ಯ'}
                </span>
              </div>

              {inputText && (
                <button
                  type="button"
                  onClick={() => {
                    setInputText('');
                    finalTranscriptRef.current = '';
                    setStatus('idle');
                    setStatusMessage('Input cleared.');
                  }}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Clean Seamless Textarea */}
            <div className="flex-1 flex flex-col my-2">
              <textarea
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  finalTranscriptRef.current = e.target.value;
                }}
                onKeyDown={handleKeyDown}
                placeholder={
                  sourceLang === 'en'
                    ? 'Click the microphone to speak in English, or type here...'
                    : 'ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಲು ಮೈಕ್ ಕ್ಲಿಕ್ ಮಾಡಿ, ಅಥವಾ ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...'
                }
                rows={7}
                className={`w-full flex-1 resize-none bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-base sm:text-lg leading-relaxed p-0 border-0 ${
                  sourceLang === 'kn' ? 'kannada-text text-xl sm:text-2xl text-amber-700 dark:text-amber-200' : ''
                }`}
              />
            </div>

            {/* Bottom Action Strip */}
            <div className="pt-4 border-t border-[#E2E8F0] dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
              {/* Voice Controls with Visual Feedback */}
              <div className="flex items-center gap-3">
                {status === 'listening' ? (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-600/30 transition hover:bg-rose-500"
                  >
                    <MicOff className="h-4 w-4" />
                    <span>Stop Recording</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startRecording}
                    disabled={status === 'translating'}
                    className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-amber-500/20 transition hover:bg-amber-400 active:scale-95 disabled:opacity-50"
                  >
                    <Mic className="h-4 w-4" />
                    <span>
                      {sourceLang === 'en' ? 'Speak in English' : 'ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ'}
                    </span>
                  </button>
                )}

                {/* Live Listening Waveform Animation */}
                {status === 'listening' && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                    <span className="hidden sm:inline">Listening...</span>
                    <div className="flex items-end gap-0.5 h-3 ml-1">
                      <span className="w-0.5 h-2 bg-rose-500 dark:bg-rose-400 rounded-full animate-pulse" />
                      <span className="w-0.5 h-3 bg-rose-500 dark:bg-rose-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                      <span className="w-0.5 h-1.5 bg-rose-500 dark:bg-rose-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Translate Button & Counter */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {inputText.length} chars
                </span>

                <button
                  type="button"
                  onClick={() => handleTranslate()}
                  disabled={!inputText.trim() || status === 'translating'}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'translating' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Translating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Translate</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Canvas: Clean Translated Output */}
          <div className="p-5 sm:p-6 flex flex-col justify-between min-h-[360px] bg-white dark:bg-slate-950/40">
            {/* Header row with output actions */}
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#172554] dark:text-slate-300">
                  {targetLang === 'kn' ? 'ಕನ್ನಡ ಅನುವಾದ (Kannada Translation)' : 'English Translation'}
                </span>
              </div>

              {translatedResult && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/90 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition shadow-xs"
                    title="Copy translation to clipboard"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePlayTTS}
                    className={`flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/90 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-300 dark:hover:border-amber-500/40 transition shadow-xs ${
                      isPlayingAudio ? 'text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-500/50 animate-pulse' : ''
                    }`}
                    title="Listen to native pronunciation"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>{isPlayingAudio ? 'Playing...' : 'Listen'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Translation Output Body */}
            <div className="flex-1 flex flex-col justify-center my-2">
              {translatedResult ? (
                <div className="space-y-4">
                  <p
                    className={`font-semibold leading-relaxed ${
                      targetLang === 'kn'
                        ? 'kannada-text text-2xl sm:text-3xl text-amber-700 dark:text-amber-300 drop-shadow-xs'
                        : 'text-xl sm:text-2xl text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {translatedResult.translated_text}
                  </p>

                  {translatedResult.transliteration && (
                    <p className="text-sm italic text-slate-600 dark:text-slate-400 font-medium">
                      &quot;{translatedResult.transliteration}&quot;
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12 text-slate-500">
                  <div className="h-12 w-12 rounded-2xl bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 flex items-center justify-center mb-3 text-slate-400 dark:text-slate-600 shadow-xs">
                    <Languages className="h-6 w-6 stroke-[1.5]" />
                  </div>
                  <p className="text-sm font-semibold text-[#172554] dark:text-slate-300">Translation will appear here</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
                    Speak into the microphone or type your message, then click &ldquo;Translate&rdquo;.
                  </p>
                </div>
              )}
            </div>

            {/* Output Metadata & Notices */}
            <div>
              {translatedResult && (
                <div className="pt-3 border-t border-[#E2E8F0] dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Direction: {translatedResult.source_language.toUpperCase()} &rarr; {translatedResult.target_language.toUpperCase()}</span>
                  <span className="capitalize">Engine: {translatedResult.provider || 'NammaKannada AI'}</span>
                </div>
              )}

              {ttsNotice && (
                <div className="mt-2 rounded-lg border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-2.5 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <span>{ttsNotice}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Integrated Status & Shortcuts Strip */}
        <div className="px-5 sm:px-6 py-2.5 border-t border-[#E2E8F0] dark:border-slate-800/80 bg-[#F8FAFC] dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                status === 'listening'
                  ? 'bg-rose-500 animate-ping'
                  : status === 'translating'
                  ? 'bg-amber-500 animate-spin'
                  : status === 'completed'
                  ? 'bg-emerald-500'
                  : status === 'error' || status === 'permission_denied'
                  ? 'bg-rose-500'
                  : 'bg-slate-400 dark:bg-slate-500'
              }`}
            />
            <span className="text-slate-500 dark:text-slate-400 font-medium">Status:</span>
            <span
              className={`${
                status === 'error' || status === 'permission_denied'
                  ? 'text-rose-600 dark:text-rose-400 font-semibold'
                  : status === 'completed'
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : status === 'listening'
                  ? 'text-amber-600 dark:text-amber-400 font-bold'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {statusMessage}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Shortcut: <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono shadow-xs">Ctrl + Enter</kbd> to translate</span>
            {!speechSupported && (
              <span className="text-amber-700 dark:text-amber-400/90 bg-amber-50 dark:bg-amber-400/10 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-400/20">
                Web Speech not available on this browser
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Quick Everyday Kannada Phrases Section: Background #FFF9ED */}
      <div className="rounded-2xl border border-[#FDE68A] dark:border-amber-500/20 bg-[#FFF9ED] dark:bg-slate-900/60 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#172554] dark:text-amber-300">
            Quick Everyday Kannada Phrases (ಕ್ಲಿಕ್ ಮಾಡಿ ಪ್ರಯತ್ನಿಸಿ):
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {examplePhrases.map((phrase) => (
            <button
              key={phrase}
              type="button"
              onClick={() => {
                setInputText(phrase);
                finalTranscriptRef.current = phrase;
                setStatus('idle');
                setStatusMessage('Example loaded. Click Translate to convert.');
              }}
              className="rounded-xl border border-amber-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-300 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-900 dark:hover:text-white transition active:scale-95 shadow-xs"
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VoiceTranslator;
