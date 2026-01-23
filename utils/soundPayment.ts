'use client';

// Hybrid FSK (Frequency Shift Keying) Sound Payment System
// Mobile devices: Audible frequencies (reliable)
// Desktop devices: Ultrasound frequencies (silent)
// All devices: Listen for BOTH ranges

const SAMPLE_RATE = 48000;
const TONE_DURATION_AUDIBLE = 0.05;
const TONE_DURATION_ULTRASOUND = 0.08;    // 80ms per char
const SILENCE_DURATION_AUDIBLE = 0.01;
const SILENCE_DURATION_ULTRASOUND = 0.02;// 15ms gap
const SYNC_DURATION_AUDIBLE = 0.05;
const SYNC_DURATION_ULTRASOUND = 0.06;    // 80ms sync

// ============================================================================
// DEVICE DETECTION - Determines broadcast mode
// ============================================================================
const detectBroadcastMode = (): 'ultrasound' | 'audible' => {
  if (typeof navigator === 'undefined') return 'audible';
  
  const ua = navigator.userAgent;
  
  // Mobile phones - use audible (speakers struggle with 18kHz)
  const isMobilePhone = /iPhone|iPod|Android.*Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  
  // Tablets - use audible (safer)
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);
  
  // Check for touch device that's not a desktop with touchscreen
  const isTouchOnly = 'ontouchend' in (typeof document !== 'undefined' ? document : {}) && !(/Windows NT|Macintosh|Linux/i.test(ua) && window.innerWidth > 1024);
  
  // Desktop detection
  const isMacDesktop = /Macintosh/i.test(ua);
  const isWindowsDesktop = /Windows NT/i.test(ua) && !isTouchOnly;
  const isLinuxDesktop = /Linux/i.test(ua) && !(/Android/i.test(ua));
  
  // Desktop/laptop with good speakers - use ultrasound
  if ((isMacDesktop || isWindowsDesktop || isLinuxDesktop) && !isMobilePhone && !isTablet) {
    return 'ultrasound';
  }
  
  // Everything else - use audible
  return 'audible';
};

const BROADCAST_MODE = typeof window !== 'undefined' ? detectBroadcastMode() : 'audible';

// ============================================================================
// FREQUENCY CONFIGURATIONS
// ============================================================================
const FREQ_CONFIG = {
  ultrasound: {
    baseFreq: 17800,
    freqStep: 30,
    syncFreq: 17500,
    endSyncFreq: 18800,
  },
  audible: {
    baseFreq: 15800,
    freqStep: 80,    // Wider spacing for audible (more reliable)
    syncFreq: 15300,
    endSyncFreq: 17000,
  }
};

// Broadcasting uses device-appropriate frequencies
const BROADCAST_CONFIG = FREQ_CONFIG[BROADCAST_MODE];
const BASE_FREQ = BROADCAST_CONFIG.baseFreq;
const FREQ_STEP = BROADCAST_CONFIG.freqStep;
const SYNC_FREQ = BROADCAST_CONFIG.syncFreq;
const END_SYNC_FREQ = BROADCAST_CONFIG.endSyncFreq;

// Listening range covers BOTH audible and ultrasound
const LISTEN_MIN_FREQ = 2500;   // Below audible sync
const LISTEN_MAX_FREQ = 19500;  // Above ultrasound end sync

let audioContext: AudioContext | null = null;
let mediaStream: MediaStream | null = null;
let analyser: AnalyserNode | null = null;
let isListening = false;

// Character set for encoding - hex only for short tokens
const CHARSET = '0123456789ABCDEF';

function charToFreq(char: string, config = FREQ_CONFIG[BROADCAST_MODE]): number {
  const index = CHARSET.indexOf(char.toUpperCase());
  if (index === -1) return config.baseFreq;
  return config.baseFreq + (index * config.freqStep);
}

function freqToChar(freq: number): { char: string; mode: 'ultrasound' | 'audible' } | null {
  // Try ultrasound range first
  const ultraConfig = FREQ_CONFIG.ultrasound;
  const ultraIndex = Math.round((freq - ultraConfig.baseFreq) / ultraConfig.freqStep);
  if (ultraIndex >= 0 && ultraIndex < CHARSET.length) {
    const expectedFreq = ultraConfig.baseFreq + (ultraIndex * ultraConfig.freqStep);
    if (Math.abs(freq - expectedFreq) < ultraConfig.freqStep * 0.6) {
      return { char: CHARSET[ultraIndex], mode: 'ultrasound' };
    }
  }
  
  // Try audible range
  const audibleConfig = FREQ_CONFIG.audible;
  const audibleIndex = Math.round((freq - audibleConfig.baseFreq) / audibleConfig.freqStep);
  if (audibleIndex >= 0 && audibleIndex < CHARSET.length) {
    const expectedFreq = audibleConfig.baseFreq + (audibleIndex * audibleConfig.freqStep);
    if (Math.abs(freq - expectedFreq) < audibleConfig.freqStep * 0.6) {
      return { char: CHARSET[audibleIndex], mode: 'audible' };
    }
  }
  
  return null;
}

// Check if frequency is a sync tone
function detectSyncType(freq: number): { type: 'start' | 'end'; mode: 'ultrasound' | 'audible' } | null {
  // Ultrasound sync tones
  if (Math.abs(freq - FREQ_CONFIG.ultrasound.syncFreq) < 300) {
    return { type: 'start', mode: 'ultrasound' };
  }
  if (Math.abs(freq - FREQ_CONFIG.ultrasound.endSyncFreq) < 300) {
    return { type: 'end', mode: 'ultrasound' };
  }
  
  // Audible sync tones
  if (Math.abs(freq - FREQ_CONFIG.audible.syncFreq) < 300) {
    return { type: 'start', mode: 'audible' };
  }
  if (Math.abs(freq - FREQ_CONFIG.audible.endSyncFreq) < 300) {
    return { type: 'end', mode: 'audible' };
  }
  
  return null;
}

// Warmup - play silent tone to unlock iOS AudioContext
export async function warmupAudio(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!audioContext || audioContext.state === 'closed') {
      audioContext = new AudioContextClass({ sampleRate: SAMPLE_RATE });
    }
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    // Play silent tone to unlock
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    gain.gain.value = 0.001; // Nearly silent
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + 0.1);
    console.log('🔊 Audio warmup complete');
  } catch (e) {
    console.warn('Warmup failed:', e);
  }
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
    console.log('🔊 Sound payment initialized (Hybrid FSK mode)');
    console.log('🔊 Broadcast mode:', BROADCAST_MODE, BROADCAST_MODE === 'ultrasound' ? '(silent)' : '(audible chirps)');
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
    if (audioContext?.state === 'suspended') {
      console.log('🔊 Resuming suspended AudioContext');
      await audioContext.resume();
    }
    console.log('🔊 AudioContext state:', audioContext?.state);
    if (!audioContext) throw new Error('Audio context not available');

    const tokenUpper = token.toUpperCase();
    console.log('🔊 Broadcasting token:', tokenUpper);
    console.log('🔊 Mode:', BROADCAST_MODE);
    console.log('🔊 Character frequencies:');
    for (const char of tokenUpper) {
      console.log(`   ${char} -> ${charToFreq(char)} Hz`);
    }

    const TONE_DURATION = BROADCAST_MODE === 'ultrasound' ? TONE_DURATION_ULTRASOUND : TONE_DURATION_AUDIBLE;
    const SYNC_DURATION = BROADCAST_MODE === 'ultrasound' ? SYNC_DURATION_ULTRASOUND : SYNC_DURATION_AUDIBLE;
    const SILENCE_DURATION = BROADCAST_MODE === 'ultrasound' ? SILENCE_DURATION_ULTRASOUND : SILENCE_DURATION_AUDIBLE;
    
    const ctx = audioContext;
    let currentTime = ctx.currentTime + 0.1;

    // Play START sync tone
    const syncOsc = ctx.createOscillator();
    const syncGain = ctx.createGain();
    syncOsc.frequency.value = FREQ_CONFIG[BROADCAST_MODE].syncFreq;
    syncGain.gain.value = BROADCAST_MODE === 'ultrasound' ? 0.8 : 0.4;
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
      gain.gain.linearRampToValueAtTime(BROADCAST_MODE === 'ultrasound' ? 0.8 : 0.4, currentTime + 0.015);
      gain.gain.setValueAtTime(0.7, currentTime + TONE_DURATION - 0.015);
      gain.gain.linearRampToValueAtTime(0, currentTime + TONE_DURATION);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(currentTime);
      osc.stop(currentTime + TONE_DURATION);
      
      currentTime += TONE_DURATION + SILENCE_DURATION;
    }

    // Play END sync tone
    currentTime += SILENCE_DURATION * 8; // Extra delay before END SYNC
    const endOsc = ctx.createOscillator();
    const endGain = ctx.createGain();
    endOsc.frequency.value = FREQ_CONFIG[BROADCAST_MODE].endSyncFreq;
    endGain.gain.value = BROADCAST_MODE === 'ultrasound' ? 0.8 : 0.4;
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
    if (audioContext?.state === 'suspended') {
      console.log('🔊 Resuming suspended AudioContext');
      await audioContext.resume();
    }
    console.log('🔊 AudioContext state:', audioContext?.state);
    if (!audioContext) throw new Error('Audio context not available');

    const TONE_DURATION = BROADCAST_MODE === 'ultrasound' ? TONE_DURATION_ULTRASOUND : TONE_DURATION_AUDIBLE;
    const SYNC_DURATION = BROADCAST_MODE === 'ultrasound' ? SYNC_DURATION_ULTRASOUND : SYNC_DURATION_AUDIBLE;
    const SILENCE_DURATION = BROADCAST_MODE === 'ultrasound' ? SILENCE_DURATION_ULTRASOUND : SILENCE_DURATION_AUDIBLE;
    
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
    analyser.fftSize = 8192;
    analyser.smoothingTimeConstant = 0.2;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const freqResolution = SAMPLE_RATE / analyser.fftSize;

    isListening = true;
    let receivedChars: string[] = [];
    let inSync = false;
    let currentMode: 'ultrasound' | 'audible' | null = null;
    let lastCharTime = 0;
    let lastChar = '';
    let lastToken = '';
    let lastTokenTime = 0;
    let syncStartTime = 0;

    console.log('🎤 Listening started... (Hybrid FSK mode)');
    console.log('🎤 Freq resolution:', freqResolution.toFixed(2), 'Hz');
    console.log('🎤 Listening for BOTH audible (3-5.5kHz) AND ultrasound (17.5-19kHz)');

    const detectFrequency = (): { freq: number, amplitude: number } | null => {
      analyser!.getByteFrequencyData(dataArray);
      
      let maxValue = 0;
      let maxIndex = 0;
      
      // Scan the full range (2.5kHz - 19.5kHz)
      const minBin = Math.floor(LISTEN_MIN_FREQ / freqResolution);
      const maxBin = Math.ceil(LISTEN_MAX_FREQ / freqResolution);
      
      for (let i = minBin; i < maxBin; i++) {
        if (dataArray[i] > maxValue) {
          maxValue = dataArray[i];
          maxIndex = i;
        }
      }
      
      if (maxValue < 20) return null;
      
      const freq = maxIndex * freqResolution;
      return { freq, amplitude: maxValue };
    };

    const processFrame = () => {
      if (!isListening) return;

      const detection = detectFrequency();
      const now = Date.now();

      if (detection) {
        const { freq, amplitude } = detection;
        
        // Check for sync tones (both ranges)
        const syncType = detectSyncType(freq);
        
        if (syncType && syncType.type === 'start' && !inSync) {
          inSync = true;
          currentMode = syncType.mode;
          syncStartTime = now;
          receivedChars = [];
          lastChar = '';
          console.log('🎤 === START SYNC ===', syncType.mode, 'amp:', amplitude, 'freq:', freq.toFixed(0));
        }
        else if (syncType && syncType.type === 'end' && inSync && syncType.mode === currentMode) {
          const token = receivedChars.join('');
          console.log('🎤 === END SYNC ===', currentMode, 'token:', token, 'chars:', receivedChars.length);
          
          if (token.length >= 4) {
            if (token !== lastToken || now - lastTokenTime > 5000) {
              lastToken = token;
              lastTokenTime = now;
              console.log('✅ TOKEN RECEIVED:', token, '(via', currentMode + ')');
              onTokenReceived(token);
            }
          } else if (token.length > 0) {
            console.log('⚠️ Token too short:', token);
          }
          
          inSync = false;
          currentMode = null;
          receivedChars = [];
          lastChar = '';
        }
        // Decode character frequencies
        else if (inSync && currentMode) {
          const charResult = freqToChar(freq);
          
          if (charResult && charResult.mode === currentMode) {
            const { char } = charResult;
            
            if (char !== lastChar && now - lastCharTime > 45) {
              receivedChars.push(char);
              lastChar = char;
              lastCharTime = now;
              console.log('🎤 Char:', char, '| freq:', freq.toFixed(0), '| amp:', amplitude, '| total:', receivedChars.join(''));
            }
          }
        }
      } else {
        // No signal - reset lastChar during silence
        if (inSync && now - lastCharTime > 100) {
          lastChar = '';
        }
        
        // Timeout
        if (inSync && now - syncStartTime > 10000) {
          console.log('⚠️ Sync timeout, resetting');
          inSync = false;
          currentMode = null;
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

export function getBroadcastMode(): 'ultrasound' | 'audible' {
  return BROADCAST_MODE;
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