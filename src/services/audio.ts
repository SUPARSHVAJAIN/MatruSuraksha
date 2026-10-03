// Low-literacy Voice Assistant for expectant mothers

export function speakMessage(text: string, lang = 'en') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9; // Slower, clearer cadence for health instructions
  utterance.pitch = 1.0;

  // Language mapping
  const langMap: Record<string, string> = {
    en: 'en-US',
    sw: 'sw-KE',
    hi: 'hi-IN',
    es: 'es-ES',
    fr: 'fr-FR',
  };

  utterance.lang = langMap[lang] || 'en-US';

  // Try to find a matching voice
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((v) => v.lang.startsWith(utterance.lang.slice(0, 2)));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
