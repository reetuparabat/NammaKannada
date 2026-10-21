import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VoiceTranslator } from '@/components/voice/VoiceTranslator';
import * as api from '@/lib/api';

jest.mock('@/lib/api', () => ({
  translateVoiceText: jest.fn(),
  api: {
    voice: {
      translate: () => '/api/v1/voice/translate',
      transcribe: () => '/api/v1/voice/transcribe',
      status: () => '/api/v1/voice/status',
    },
  },
}));

describe('VoiceTranslator Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with initial English to Kannada direction', () => {
    render(<VoiceTranslator />);

    expect(screen.getByText('English (EN)')).toBeInTheDocument();
    expect(screen.getByText('ಕನ್ನಡ • Kannada (KN)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /swap translation direction/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /speak in english/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /translate/i })).toBeInTheDocument();
  });

  it('swaps language direction when Swap Direction button is clicked', () => {
    render(<VoiceTranslator />);

    const swapBtn = screen.getByRole('button', { name: /swap translation direction/i });
    fireEvent.click(swapBtn);

    // After swapping, source is Kannada and target is English
    expect(screen.getByRole('button', { name: /ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ/i })).toBeInTheDocument();
    expect(screen.getByText('English (EN)')).toBeInTheDocument();
  });

  it('allows entering text and clears it when Clear button is clicked', () => {
    render(<VoiceTranslator />);

    const textarea = screen.getByPlaceholderText(/click the microphone to speak in english/i);
    fireEvent.change(textarea, { target: { value: 'Where is the bus stop?' } });

    expect(textarea).toHaveValue('Where is the bus stop?');

    const clearBtn = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearBtn);

    expect(textarea).toHaveValue('');
  });

  it('calls translateVoiceText and displays the translated result', async () => {
    (api.translateVoiceText as jest.Mock).mockResolvedValueOnce({
      translated_text: 'ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?',
      source_language: 'en',
      target_language: 'kn',
      provider: 'mymemory',
      transliteration: null,
    });

    render(<VoiceTranslator />);

    const textarea = screen.getByPlaceholderText(/click the microphone to speak in english/i);
    fireEvent.change(textarea, { target: { value: 'Where is the bus stop?' } });

    const translateBtn = screen.getByRole('button', { name: /translate/i });
    fireEvent.click(translateBtn);

    await waitFor(() => {
      expect(api.translateVoiceText).toHaveBeenCalledWith('Where is the bus stop?', 'en', 'kn');
      expect(screen.getByText('ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?')).toBeInTheDocument();
    });
  });

  it('displays an error message when translation fails', async () => {
    (api.translateVoiceText as jest.Mock).mockRejectedValueOnce(
      new Error('Translation service timeout')
    );

    render(<VoiceTranslator />);

    const textarea = screen.getByPlaceholderText(/click the microphone to speak in english/i);
    fireEvent.change(textarea, { target: { value: 'Hello' } });

    const translateBtn = screen.getByRole('button', { name: /translate/i });
    fireEvent.click(translateBtn);

    await waitFor(() => {
      expect(screen.getByText(/translation failed/i)).toBeInTheDocument();
    });
  });
});
