'use client';

// Simple FSK (Frequency Shift Keying) Sound Payment System
// Encodes payment tokens as audio frequencies

const SAMPLE_RATE = 48000;
const BASE_FREQ = 4000;        // Start frequency (Hz)
const FREQ_STEP = 150;         // Increased spacing between frequencies
const TONE_DURATION = 0.1;     // Longer tone duration
const SILENCE_DURATION = 0.05; // Longer gap between tones
const SYNC_FREQ = 2500;        // Lower sync tone - more distinct
const SYNC_DURATION = 0.2;     // Longer sync

let audioContext: AudioContext | null = null;
let mediaStream: MediaStream | null = null;
let analyser: AnalyserNode | null = null;
let isListening = false;

// Character set for encoding - covers pay_[hex]
const CHARSET = '_.0123456789abcdefsnpy';

function charToFreq(char: string): number {
  const index = CHARSET.indexOf(char.toLowerCase());
  if (index === -1) return BASE_FREQ;
  return BASE_FREQ + (index * FREQ_STEP);
}

function freqToChar(freq: number): string | null {
  const index = Math.round((freq - BASE_FREQ) / FREQ_STEP);
  if (index < 0 || index >= CHARSET.length) return null;
  return CHARSET[index];
}

export async function initSoundPayment(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!audioContext || audioContext.state === 'closed') {
      audioContext = new AudioContextClass({ sampleRate: SAMPLE_RATE });
    }
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    console.log('🔊 Sound payment initialized (FSK mode)');
    return true;
  } catch (error) {
    console.error('Failed to initialize:', error);
    return false;
  }
}

export async function broadcastToken(token: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    await initSoundPayment();
    if (!audioContext) throw new Error('Audio context not available');

    console.log('🔊 Broadcasting token:', token);
    console.log('🔊 Character frequencies:');
    for (const char of token) {
      console.log(`   ${char} -> ${charToFreq(char)} Hz`);
    }

    const ctx = audioContext;
    let currentTime = ctx.currentTime + 0.1;

    // Play sync tone first (start marker)
    const syncOsc = ctx.createOscillator();
    const syncGain = ctx.createGain();
    syncOsc.frequency.value = SYNC_FREQ;
    syncGain.gain.value = 0.6;
    syncOsc.connect(syncGain);
    syncGain.connect(ctx.destination);
    syncOsc.start(currentTime);
    syncOsc.stop(currentTime + SYNC_DURATION);
    currentTime += SYNC_DURATION + SILENCE_DURATION * 2;

    // Play each character as a frequency
    for (const char of token) {
      const freq = charToFreq(char);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.frequency.value = freq;
      osc.type = 'sine';
      
      // Smooth envelope
      gain.gain.setValueAtTime(0, currentTime);
      gain.gain.linearRampToValueAtTime(0.6, currentTime + 0.01);
      gain.gain.setValueAtTime(0.6, currentTime + TONE_DURATION - 0.01);
      gain.gain.linearRampToValueAtTime(0, currentTime + TONE_DURATION);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(currentTime);
      osc.stop(currentTime + TONE_DURATION);
      
      currentTime += TONE_DURATION + SILENCE_DURATION;
    }

    // Play end sync tone
    currentTime += SILENCE_DURATION;
    const endOsc = ctx.createOscillator();
    const endGain = ctx.createGain();
    endOsc.frequency.value = SYNC_FREQ;
    endGain.gain.value = 0.6;
    endOsc.connect(endGain);
    endGain.connect(ctx.destination);
    endOsc.start(currentTime);
    endOsc.stop(currentTime + SYNC_DURATION);

    const totalDuration = (currentTime + SYNC_DURATION - ctx.currentTime) * 1000;
    console.log('🔊 Broadcast duration:', totalDuration.toFixed(0), 'ms');

    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('🔊 Broadcast complete');
        resolve(true);
      }, totalDuration + 100);
    });

  } catch (error) {
    console.error('Broadcast error:', error);
    return false;
  }
}

export async function startListening(
  onTokenReceived: (token: string) => void,
  onError?: (error: string) => void
): Promise<() => void> {
  if (typeof window === 'undefined') return () => {};
  if (isListening) return () => {};

  try {
    await initSoundPayment();
    if (!audioContext) throw new Error('Audio context not available');

    const ctx = audioContext;

    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      }
    });

    console.log('🎤 Mic granted');

    const source = ctx.createMediaStreamSource(mediaStream);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 8192;  // Higher resolution
    analyser.smoothingTimeConstant = 0.3;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const freqResolution = SAMPLE_RATE / analyser.fftSize;

    isListening = true;
    let receivedChars: string[] = [];
    let inSync = false;
    let lastCharTime = 0;
    let lastChar = '';
    let lastToken = '';
    let lastTokenTime = 0;

    console.log('🎤 Listening started... (FSK mode)');
    console.log('🎤 Freq resolution:', freqResolution.toFixed(2), 'Hz');
    console.log('🎤 Sync freq:', SYNC_FREQ, 'Hz');
    console.log('🎤 Char freq range:', BASE_FREQ, '-', BASE_FREQ + CHARSET.length * FREQ_STEP, 'Hz');

    const detectFrequency = (): { freq: number, amplitude: number } | null => {
      analyser!.getByteFrequencyData(dataArray);
      
      let maxValue = 0;
      let maxIndex = 0;
      
      // Look for peaks in our frequency range (2000-7000 Hz)
      const minBin = Math.floor(2000 / freqResolution);
      const maxBin = Math.ceil(7000 / freqResolution);
      
      for (let i = minBin; i < maxBin; i++) {
        if (dataArray[i] > maxValue) {
          maxValue = dataArray[i];
          maxIndex = i;
        }
      }
      
      if (maxValue < 120) return null;  // Need strong signal
      
      const freq = maxIndex * freqResolution;
      return { freq, amplitude: maxValue };
    };

    const processFrame = () => {
      if (!isListening) return;

      const detection = detectFrequency();
      const now = Date.now();

      if (detection) {
        const { freq, amplitude } = detection;
        
        // Check for sync tone (with tolerance)
        if (Math.abs(freq - SYNC_FREQ) < 100) {
          if (!inSync && receivedChars.length === 0) {
            // Start sync
            inSync = true;
            receivedChars = [];
            lastChar = '';
            console.log('🎤 === START SYNC === amp:', amplitude);
          } else if (inSync && receivedChars.length >= 4) {
            // End sync - we have characters
            const token = receivedChars.join('');
            console.log('🎤 === END SYNC === token:', token);
            
            if (token.startsWith('pay_') && token.length >= 8) {
              if (token !== lastToken || now - lastTokenTime > 5000) {
                lastToken = token;
                lastTokenTime = now;
                console.log('✅ TOKEN RECEIVED:', token);
                onTokenReceived(token);
              }
            }
            
            inSync = false;
            receivedChars = [];
            lastChar = '';
          }
        } else if (inSync) {
          // Try to decode character
          const char = freqToChar(freq);
          
          // Only record if different from last char and enough time passed
          if (char && char !== lastChar && now - lastCharTime > 80) {
            receivedChars.push(char);
            lastChar = char;
            lastCharTime = now;
            console.log('🎤 Char:', char, '| freq:', freq.toFixed(0), '| amp:', amplitude, '| total:', receivedChars.join(''));
          }
        }
      } else {
        // No signal - could be silence between tones
        if (inSync && now - lastCharTime > 300) {
          // Reset lastChar during silence to allow same char twice
          lastChar = '';
        }
      }

      requestAnimationFrame(processFrame);
    };

    requestAnimationFrame(processFrame);

    return () => {
      isListening = false;
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
      }
      if (analyser) {
        analyser.disconnect();
        analyser = null;
      }
      console.log('🎤 Stopped');
    };

  } catch (error: any) {
    console.error('Listen error:', error);
    if (onError) {
      if (error.name === 'NotAllowedError') {
        onError('Microphone permission denied');
      } else {
        onError(error.message || 'Failed to listen');
      }
    }
    return () => {};
  }
}

export function isSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(
    (window.AudioContext || (window as any).webkitAudioContext) &&
    navigator.mediaDevices?.getUserMedia
  );
}

export function cleanup() {
  isListening = false;
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
  if (analyser) {
    analyser.disconnect();
    analyser = null;
  }
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close();
    audioContext = null;
  }
}
