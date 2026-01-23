'use client';

// Simple FSK (Frequency Shift Keying) Sound Payment System
// Encodes payment tokens as audio frequencies

const SAMPLE_RATE = 48000;
const BASE_FREQ = 18250;       // Ultrasound range - inaudible
const FREQ_STEP = 30;          // Tight spacing in narrow band
const TONE_DURATION = 0.04;    // 40ms - fast
const SILENCE_DURATION = 0.015;// 15ms gap
const SYNC_FREQ = 18000;       // Start sync
const END_SYNC_FREQ = 18500;   // End sync
const SYNC_DURATION = 0.08;    // 80ms sync

let audioContext: AudioContext | null = null;
let mediaStream: MediaStream | null = null;
let analyser: AnalyserNode | null = null;
let isListening = false;

// Character set for encoding - hex only for short tokens
const CHARSET = '0123456789ABCDEF';

function charToFreq(char: string): number {
  const index = CHARSET.indexOf(char.toUpperCase());
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

    const tokenUpper = token.toUpperCase();
    console.log('🔊 Broadcasting token:', tokenUpper);
    console.log('🔊 Character frequencies:');
    for (const char of tokenUpper) {
      console.log(`   ${char} -> ${charToFreq(char)} Hz`);
    }

    const ctx = audioContext;
    let currentTime = ctx.currentTime + 0.1;

    // Play START sync tone
    const syncOsc = ctx.createOscillator();
    const syncGain = ctx.createGain();
    syncOsc.frequency.value = SYNC_FREQ;
    syncGain.gain.value = 0.7;
    syncOsc.connect(syncGain);
    syncGain.connect(ctx.destination);
    syncOsc.start(currentTime);
    syncOsc.stop(currentTime + SYNC_DURATION);
    currentTime += SYNC_DURATION + SILENCE_DURATION * 2;

    // Play each character as a frequency
    for (const char of tokenUpper) {
      const freq = charToFreq(char);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.frequency.value = freq;
      osc.type = 'sine';
      
      // Smooth envelope to reduce clicks
      gain.gain.setValueAtTime(0, currentTime);
      gain.gain.linearRampToValueAtTime(0.7, currentTime + 0.015);
      gain.gain.setValueAtTime(0.7, currentTime + TONE_DURATION - 0.015);
      gain.gain.linearRampToValueAtTime(0, currentTime + TONE_DURATION);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(currentTime);
      osc.stop(currentTime + TONE_DURATION);
      
      currentTime += TONE_DURATION + SILENCE_DURATION;
    }

    // Play END sync tone (different frequency!)
    currentTime += SILENCE_DURATION;
    const endOsc = ctx.createOscillator();
    const endGain = ctx.createGain();
    endOsc.frequency.value = END_SYNC_FREQ;
    endGain.gain.value = 0.7;
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
    analyser.fftSize = 8192;  // High resolution
    analyser.smoothingTimeConstant = 0.2;
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
    let syncStartTime = 0;

    console.log('🎤 Listening started... (FSK mode)');
    console.log('🎤 Freq resolution:', freqResolution.toFixed(2), 'Hz');
    console.log('🎤 Start sync freq:', SYNC_FREQ, 'Hz');
    console.log('🎤 End sync freq:', END_SYNC_FREQ, 'Hz');
    console.log('🎤 Char freq range:', BASE_FREQ, '-', BASE_FREQ + CHARSET.length * FREQ_STEP, 'Hz');

    const detectFrequency = (): { freq: number, amplitude: number } | null => {
      analyser!.getByteFrequencyData(dataArray);
      
      let maxValue = 0;
      let maxIndex = 0;
      
      // Look for peaks in ultrasound range (17500-19000 Hz)
      const minBin = Math.floor(17500 / freqResolution);
      const maxBin = Math.ceil(19000 / freqResolution);
      
      for (let i = minBin; i < maxBin; i++) {
        if (dataArray[i] > maxValue) {
          maxValue = dataArray[i];
          maxIndex = i;
        }
      }
      
      if (maxValue < 60) return null;  // Lower threshold for ultrasound
      
      const freq = maxIndex * freqResolution;
      return { freq, amplitude: maxValue };
    };

    const processFrame = () => {
      if (!isListening) return;

      const detection = detectFrequency();
      const now = Date.now();

      if (detection) {
        const { freq, amplitude } = detection;
        
        // Check for START sync tone (18000 Hz)
        if (!inSync && Math.abs(freq - SYNC_FREQ) < 300) {
          inSync = true;
          syncStartTime = now;
          receivedChars = [];
          lastChar = '';
          console.log('🎤 === START SYNC === amp:', amplitude, 'freq:', freq.toFixed(0));
        }
        // Check for END sync tone (18500 Hz)
        else if (inSync && Math.abs(freq - END_SYNC_FREQ) < 300) {
          const token = receivedChars.join('');
          console.log('🎤 === END SYNC === token:', token, 'chars:', receivedChars.length);
          
          // Accept any 4+ char token (short hex like "A9F2")
          if (token.length >= 4) {
            if (token !== lastToken || now - lastTokenTime > 5000) {
              lastToken = token;
              lastTokenTime = now;
              console.log('✅ TOKEN RECEIVED:', token);
              onTokenReceived(token);
            }
          } else if (token.length > 0) {
            console.log('⚠️ Token too short:', token);
          }
          
          inSync = false;
          receivedChars = [];
          lastChar = '';
        }
        // Decode character frequencies
        else if (inSync) {
          // Ignore if outside character range
          if (freq < BASE_FREQ - 100 || freq > BASE_FREQ + CHARSET.length * FREQ_STEP + 100) {
            return requestAnimationFrame(processFrame);
          }
          
          const char = freqToChar(freq);
          
          // Only record if different from last char and enough time passed
          if (char && char !== lastChar && now - lastCharTime > 70) {
            receivedChars.push(char);
            lastChar = char;
            lastCharTime = now;
            console.log('🎤 Char:', char, '| freq:', freq.toFixed(0), '| amp:', amplitude, '| total:', receivedChars.join(''));
          }
        }
      } else {
        // No signal - reset lastChar during silence to allow repeated chars
        if (inSync && now - lastCharTime > 100) {
          lastChar = '';
        }
        
        // Timeout - if in sync too long without end sync, reset
        if (inSync && now - syncStartTime > 10000) {
          console.log('⚠️ Sync timeout, resetting');
          inSync = false;
          receivedChars = [];
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
