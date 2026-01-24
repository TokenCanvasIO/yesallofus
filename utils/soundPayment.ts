'use client';

// =============================================================================
// BOMBPROOF FSK Sound Payment System
// =============================================================================
// 
// Protocol: Fixed Symbol Timing with Gap Tones
// 
// Transmission format:
//   [PREAMBLE] → [GAP] → [CHAR1] → [GAP] → [CHAR2] → [GAP] → ... → [POSTAMBLE]
//
// Key principle: GAP tone between EVERY character eliminates repeated-char problem
// Receiver locks to preamble, then samples at fixed time slots
//
// =============================================================================

const SAMPLE_RATE = 48000;

// =============================================================================
// TIMING CONFIGURATION (in seconds)
// =============================================================================
const TIMING = {
  // Preamble/Postamble - long enough to reliably detect
  PREAMBLE_DURATION: 0.20,      // 200ms - longer for better receiver lock 
  POSTAMBLE_DURATION: 0.20,     // 200ms - longer for reliable detection
  
  // Character and gap durations
  CHAR_DURATION: 0.12,          // 120ms per character - more time to detect
  GAP_DURATION: 0.06,           // 60ms gap - MUST be long enough to detect
  
  // Receiver timing
  SAMPLE_DELAY: 0.05,           // Sample 50ms into char slot
  PREAMBLE_MIN_DURATION: 0.08,  // Min time to confirm preamble
  
  // Envelope for smooth transitions
  ATTACK_TIME: 0.012,           // 12ms fade in
  RELEASE_TIME: 0.012,          // 12ms fade out
};

// Calculate total broadcast duration for a token
const calculateDuration = (tokenLength: number): number => {
  return TIMING.PREAMBLE_DURATION + 
         TIMING.GAP_DURATION +  // gap after preamble
         (tokenLength * TIMING.CHAR_DURATION) + 
         (tokenLength * TIMING.GAP_DURATION) +  // gap after each char
         TIMING.POSTAMBLE_DURATION;
};

// =============================================================================
// DEVICE DETECTION
// =============================================================================
const detectBroadcastMode = (): 'ultrasound' | 'audible' => {
  if (typeof window === 'undefined') return 'audible';
  const isLargeScreen = window.innerWidth > 1024;
  return isLargeScreen ? 'ultrasound' : 'audible';
};

const BROADCAST_MODE = typeof window !== 'undefined' ? detectBroadcastMode() : 'audible';

// =============================================================================
// FREQUENCY CONFIGURATIONS
// =============================================================================
const FREQ_CONFIG = {
  ultrasound: {
    baseFreq: 17800,
    freqStep: 30,
    syncFreq: 17500,       // PREAMBLE
    gapFreq: 17650,        // GAP tone (between sync and data range)
    endSyncFreq: 19500,    // POSTAMBLE - MOVED MUCH HIGHER (was 18800)
    // Char range: 17800 (0) to 18250 (F) - gap to postamble now 1250 Hz
  },
  audible: {
    // 15000 Hz range - this is the sweet spot for iPhone speakers!
    baseFreq: 15500,       // Character base frequency
    freqStep: 80,          // 80 Hz per character (0-F = 0-1200 Hz range)
    syncFreq: 15000,       // PREAMBLE
    gapFreq: 15250,        // GAP tone (between sync and data range)
    endSyncFreq: 17000,    // POSTAMBLE
    // Char range: 15500 (0) to 16700 (F)
  }
};

// Character set for encoding - hex only
const CHARSET = '0123456789ABCDEF';

// =============================================================================
// FREQUENCY HELPERS
// =============================================================================
function charToFreq(char: string, mode: 'ultrasound' | 'audible' = BROADCAST_MODE): number {
  const config = FREQ_CONFIG[mode];
  const index = CHARSET.indexOf(char.toUpperCase());
  if (index === -1) return config.baseFreq;
  return config.baseFreq + (index * config.freqStep);
}

function freqToChar(freq: number, mode: 'ultrasound' | 'audible'): string | null {
  const config = FREQ_CONFIG[mode];
  const index = Math.round((freq - config.baseFreq) / config.freqStep);
  if (index < 0 || index >= CHARSET.length) return null;
  
  // Check if frequency is close enough to expected
  const expectedFreq = config.baseFreq + (index * config.freqStep);
  const tolerance = config.freqStep * 0.5;
  if (Math.abs(freq - expectedFreq) > tolerance) return null;
  
  return CHARSET[index];
}

function identifyTone(freq: number, mode: 'ultrasound' | 'audible', logUnknown: boolean = false): 
  { type: 'preamble' | 'gap' | 'postamble' | 'char'; char?: string } | null {
  
  const config = FREQ_CONFIG[mode];
  const tolerance = mode === 'ultrasound' ? 100 : 120;  // Increased tolerance
  
  // Check preamble
  if (Math.abs(freq - config.syncFreq) < tolerance) {
    return { type: 'preamble' };
  }
  
  // Check gap
  if (Math.abs(freq - config.gapFreq) < tolerance) {
    return { type: 'gap' };
  }
  
  // Check postamble - use VERY strict tolerance to avoid false positives
  // Postamble is now at 19500 Hz (ultrasound), far from chars (max 18250 Hz)
  if (Math.abs(freq - config.endSyncFreq) < 200) {
    return { type: 'postamble' };
  }
  
  // Check character
  const char = freqToChar(freq, mode);
  if (char) {
    return { type: 'char', char };
  }
  
  return null;
}

// =============================================================================
// AUDIO CONTEXT MANAGEMENT
// =============================================================================
let audioContext: AudioContext | null = null;
let mediaStream: MediaStream | null = null;
let analyser: AnalyserNode | null = null;
let isListening = false;

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
    // Play silent tone to unlock iOS
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    gain.gain.value = 0.001;
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + 0.1);
    console.log('🔊 [INIT] Audio warmup complete');
  } catch (e) {
    console.warn('🔊 [INIT] Warmup failed:', e);
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
    console.log('🔊 [INIT] Sound payment initialized (BOMBPROOF protocol)');
    console.log('🔊 [INIT] Broadcast mode:', BROADCAST_MODE, BROADCAST_MODE === 'ultrasound' ? '(silent)' : '(audible chirps)');
    console.log('🔊 [INIT] Timing: CHAR=' + (TIMING.CHAR_DURATION * 1000) + 'ms, GAP=' + (TIMING.GAP_DURATION * 1000) + 'ms');
    return true;
  } catch (error) {
    console.error('🔊 [INIT] Failed to initialize:', error);
    return false;
  }
}

// =============================================================================
// BROADCAST (TRANSMITTER)
// =============================================================================
export interface BroadcastSettings {
  volume?: number;
}

export async function broadcastToken(token: string, settings?: BroadcastSettings): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    await initSoundPayment();
    if (!audioContext) throw new Error('Audio context not available');
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const tokenUpper = token.toUpperCase();
    const config = FREQ_CONFIG[BROADCAST_MODE];
    const volume = settings?.volume ?? (BROADCAST_MODE === 'ultrasound' ? 0.8 : 0.7);
    const totalDuration = calculateDuration(tokenUpper.length);
    
    console.log('🔊 ══════════════════════════════════════════════════════════');
    console.log('🔊 [TX] BROADCAST START');
    console.log('🔊 [TX] Token:', tokenUpper);
    console.log('🔊 [TX] Mode:', BROADCAST_MODE);
    console.log('🔊 [TX] Volume:', volume);
    console.log('🔊 [TX] Total duration:', (totalDuration * 1000).toFixed(0) + 'ms');
    console.log('🔊 [TX] ──────────────────────────────────────────────────────');
    console.log('🔊 [TX] Frequency map:');
    console.log('🔊 [TX]   PREAMBLE  →', config.syncFreq, 'Hz');
    console.log('🔊 [TX]   GAP       →', config.gapFreq, 'Hz');
    for (const char of tokenUpper) {
      console.log('🔊 [TX]   CHAR "' + char + '"  →', charToFreq(char), 'Hz');
    }
    console.log('🔊 [TX]   POSTAMBLE →', config.endSyncFreq, 'Hz');
    console.log('🔊 [TX] ──────────────────────────────────────────────────────');

    const ctx = audioContext;
    let currentTime = ctx.currentTime + 0.05; // Small buffer
    
    // Helper to play a tone with envelope
    const playTone = (freq: number, duration: number, label: string) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.frequency.value = freq;
      osc.type = 'sine';
      
      // Smooth envelope
      gain.gain.setValueAtTime(0, currentTime);
      gain.gain.linearRampToValueAtTime(volume, currentTime + TIMING.ATTACK_TIME);
      gain.gain.setValueAtTime(volume, currentTime + duration - TIMING.RELEASE_TIME);
      gain.gain.linearRampToValueAtTime(0, currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(currentTime);
      osc.stop(currentTime + duration);
      
      const startMs = ((currentTime - ctx.currentTime) * 1000).toFixed(0);
      console.log('🔊 [TX] @' + startMs + 'ms: ' + label + ' (' + freq + 'Hz, ' + (duration * 1000).toFixed(0) + 'ms)');
      
      currentTime += duration;
    };

    // 1. PREAMBLE
    playTone(config.syncFreq, TIMING.PREAMBLE_DURATION, 'PREAMBLE');
    
    // 2. GAP after preamble
    playTone(config.gapFreq, TIMING.GAP_DURATION, 'GAP');
    
    // 3. For each character: CHAR + GAP
    for (let i = 0; i < tokenUpper.length; i++) {
      const char = tokenUpper[i];
      const freq = charToFreq(char);
      playTone(freq, TIMING.CHAR_DURATION, 'CHAR[' + i + ']="' + char + '"');
      playTone(config.gapFreq, TIMING.GAP_DURATION, 'GAP');
    }
    
    // 4. POSTAMBLE
    playTone(config.endSyncFreq, TIMING.POSTAMBLE_DURATION, 'POSTAMBLE');

    console.log('🔊 [TX] ──────────────────────────────────────────────────────');
    console.log('🔊 [TX] All tones scheduled, waiting for completion...');

    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('🔊 [TX] BROADCAST COMPLETE');
        console.log('🔊 ══════════════════════════════════════════════════════════');
        resolve(true);
      }, totalDuration * 1000 + 100);
    });

  } catch (error) {
    console.error('🔊 [TX] Broadcast error:', error);
    return false;
  }
}

// =============================================================================
// LISTEN (RECEIVER) - Fixed Symbol Timing State Machine
// =============================================================================
type ReceiverState = 'IDLE' | 'PREAMBLE_DETECTED' | 'WAITING_FOR_GAP' | 'WAITING_FOR_CHAR' | 'COMPLETE';

export async function startListening(
  onTokenReceived: (token: string) => void,
  onError?: (error: string) => void,
  onProgress?: (state: 'ready' | 'sync' | 'receiving', chars?: string) => void
): Promise<() => void> {
  if (typeof window === 'undefined') return () => {};
  if (isListening) {
    console.log('🎤 [RX] Already listening, ignoring duplicate call');
    return () => {};
  }

  try {
    await initSoundPayment();
    if (!audioContext) throw new Error('Audio context not available');
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const ctx = audioContext;

    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      }
    });

    console.log('🎤 ══════════════════════════════════════════════════════════');
    console.log('🎤 [RX] RECEIVER STARTED');
    console.log('🎤 [RX] Mic granted');
    onProgress?.('ready');

    const source = ctx.createMediaStreamSource(mediaStream);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 8192;
    analyser.smoothingTimeConstant = 0.3;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const freqResolution = SAMPLE_RATE / analyser.fftSize;

    console.log('🎤 [RX] FFT size:', analyser.fftSize);
    console.log('🎤 [RX] Freq resolution:', freqResolution.toFixed(2), 'Hz');
    console.log('🎤 [RX] Listening for BOTH audible and ultrasound');
    console.log('🎤 [RX] ──────────────────────────────────────────────────────');

    isListening = true;
    
    // State machine variables
    let state: ReceiverState = 'IDLE';
    let detectedMode: 'ultrasound' | 'audible' | null = null;
    let receivedChars: string[] = [];
    let preambleStartTime = 0;
    let lastGapTime = 0;
    let lastToken = '';
    let lastTokenTime = 0;
    let stateStartTime = 0;
    let consecutivePreambleCount = 0;
    let consecutiveGapCount = 0;
    
    const AMPLITUDE_THRESHOLD = 25;  // Lowered for better postamble detection
    const PREAMBLE_CONFIRM_COUNT = 3;  // Need 3 consecutive preamble detections
    const GAP_CONFIRM_COUNT = 1;       // Need 1 gap detection (faster!)
    const CHAR_CONFIRM_COUNT = 1;      // Need 1 char detection (faster!)
    
    let lastDetectedChar: string | null = null;
    let charConfirmCount = 0;

    // Detect peak frequency in range
    const detectFrequency = (minFreq: number, maxFreq: number): { freq: number; amplitude: number } | null => {
      analyser!.getByteFrequencyData(dataArray);
      
      const minBin = Math.floor(minFreq / freqResolution);
      const maxBin = Math.ceil(maxFreq / freqResolution);
      
      let maxValue = 0;
      let maxIndex = 0;
      
      for (let i = minBin; i < maxBin; i++) {
        if (dataArray[i] > maxValue) {
          maxValue = dataArray[i];
          maxIndex = i;
        }
      }
      
      if (maxValue < AMPLITUDE_THRESHOLD) return null;
      
      return { freq: maxIndex * freqResolution, amplitude: maxValue };
    };

    // Try both frequency ranges
    // IMPORTANT: Check audible FIRST because its POSTAMBLE (17000 Hz) 
    // could be confused with ultrasound PREAMBLE (17500 Hz)
    const detectAnySignal = (): { freq: number; amplitude: number; mode: 'ultrasound' | 'audible' } | null => {
      // Try audible first (14500-17200 Hz) - the 15000 Hz sweet spot for iPhone
      // Upper limit 17200 to include POSTAMBLE but not overlap with ultrasound PREAMBLE
      const audible = detectFrequency(14500, 17200);
      if (audible && audible.amplitude > AMPLITUDE_THRESHOLD) {
        return { ...audible, mode: 'audible' };
      }
      
      // Try ultrasound (17300-20000 Hz) - starts above audible POSTAMBLE
      const ultra = detectFrequency(17300, 20000);
      if (ultra && ultra.amplitude > AMPLITUDE_THRESHOLD) {
        return { ...ultra, mode: 'ultrasound' };
      }
      
      return null;
    };

    const processFrame = () => {
      if (!isListening) return;

      const now = Date.now();
      const detection = detectAnySignal();

      // Debug: log any strong signal detected (every 500ms to avoid spam)
      if (detection && detection.amplitude > 50 && now % 500 < 20) {
        console.log('🎤 [RX] Signal detected | mode:', detection.mode, '| freq:', detection.freq.toFixed(0), '| amp:', detection.amplitude);
      }

      if (detection) {
        const { freq, amplitude, mode } = detection;
        const tone = identifyTone(freq, mode);

        switch (state) {
          case 'IDLE':
            // Looking for preamble
            if (tone?.type === 'preamble') {
              consecutivePreambleCount++;
              if (consecutivePreambleCount >= PREAMBLE_CONFIRM_COUNT) {
                state = 'PREAMBLE_DETECTED';
                detectedMode = mode;
                preambleStartTime = now;
                stateStartTime = now;
                receivedChars = [];
                console.log('🎤 [RX] ══════════════════════════════════════════════════════════');
                console.log('🎤 [RX] PREAMBLE LOCKED | mode:', mode, '| freq:', freq.toFixed(0), '| amp:', amplitude);
                onProgress?.('sync');
              }
            } else {
              consecutivePreambleCount = 0;
            }
            break;

          case 'PREAMBLE_DETECTED':
            // Wait for first GAP after preamble
            if (tone?.type === 'gap') {
              consecutiveGapCount++;
              if (consecutiveGapCount >= GAP_CONFIRM_COUNT) {
                state = 'WAITING_FOR_CHAR';
                lastGapTime = now;
                stateStartTime = now;
                consecutiveGapCount = 0;
                console.log('🎤 [RX] GAP after preamble | freq:', freq.toFixed(0), '| amp:', amplitude);
                console.log('🎤 [RX] ──────────────────────────────────────────────────────');
              }
            } else if (tone?.type === 'preamble') {
              // Still in preamble, that's fine
              consecutiveGapCount = 0;
            } else {
              // Something else detected - log it!
              console.log('🎤 [RX] ? In PREAMBLE_DETECTED, got:', tone?.type || 'unknown', '| freq:', freq.toFixed(0), '| amp:', amplitude, '| gapCount:', consecutiveGapCount);
              consecutiveGapCount = 0;
            }
            break;

          case 'WAITING_FOR_CHAR':
            // Looking for character tone
            if (tone?.type === 'char' && tone.char) {
              // Require consecutive confirmations of same char
              if (tone.char === lastDetectedChar) {
                charConfirmCount++;
              } else {
                lastDetectedChar = tone.char;
                charConfirmCount = 1;
              }
              
              if (charConfirmCount >= CHAR_CONFIRM_COUNT) {
                receivedChars.push(tone.char);
                state = 'WAITING_FOR_GAP';
                stateStartTime = now;
                charConfirmCount = 0;
                lastDetectedChar = null;
                console.log('🎤 [RX] CHAR[' + (receivedChars.length - 1) + '] = "' + tone.char + '" | freq:', freq.toFixed(0), '| amp:', amplitude, '| token so far:', receivedChars.join(''));
                onProgress?.('receiving', receivedChars.join(''));
              }
            } else if (tone?.type === 'postamble') {
              // End of transmission
              state = 'COMPLETE';
              const token = receivedChars.join('');
              console.log('🎤 [RX] ──────────────────────────────────────────────────────');
              console.log('🎤 [RX] POSTAMBLE DETECTED | freq:', freq.toFixed(0));
              console.log('🎤 [RX] TOKEN COMPLETE:', token, '| length:', token.length);
              
              if (token.length >= 4) {
                if (token !== lastToken || now - lastTokenTime > 5000) {
                  lastToken = token;
                  lastTokenTime = now;
                  console.log('🎤 [RX] ✅ TOKEN ACCEPTED:', token);
                  console.log('🎤 ══════════════════════════════════════════════════════════');
                  onTokenReceived(token);
                } else {
                  console.log('🎤 [RX] ⚠️ Duplicate token ignored');
                }
              } else {
                console.log('🎤 [RX] ⚠️ Token too short, discarding');
              }
              
              // Reset
              state = 'IDLE';
              detectedMode = null;
              receivedChars = [];
              consecutivePreambleCount = 0;
              consecutiveGapCount = 0;
              charConfirmCount = 0;
              lastDetectedChar = null;
            } else if (tone?.type === 'gap') {
              // Still gap, waiting for char - reset char detection
              lastDetectedChar = null;
              charConfirmCount = 0;
            } else {
              // Unknown tone - log it for debugging
              if (tone) {
                console.log('🎤 [RX] ? Unknown tone in WAITING_FOR_CHAR | type:', tone.type, '| freq:', freq.toFixed(0), '| amp:', amplitude);
              }
            }
            break;

          case 'WAITING_FOR_GAP':
            // Looking for gap after character
            if (tone?.type === 'gap') {
              consecutiveGapCount++;
              if (consecutiveGapCount >= GAP_CONFIRM_COUNT) {
                state = 'WAITING_FOR_CHAR';
                lastGapTime = now;
                stateStartTime = now;
                consecutiveGapCount = 0;
                console.log('🎤 [RX] GAP after char | freq:', freq.toFixed(0), '| amp:', amplitude);
              }
            } else if (tone?.type === 'postamble') {
              // End of transmission (no gap before postamble sometimes)
              state = 'COMPLETE';
              const token = receivedChars.join('');
              console.log('🎤 [RX] ──────────────────────────────────────────────────────');
              console.log('🎤 [RX] POSTAMBLE DETECTED | freq:', freq.toFixed(0));
              console.log('🎤 [RX] TOKEN COMPLETE:', token, '| length:', token.length);
              
              if (token.length >= 4) {
                if (token !== lastToken || now - lastTokenTime > 5000) {
                  lastToken = token;
                  lastTokenTime = now;
                  console.log('🎤 [RX] ✅ TOKEN ACCEPTED:', token);
                  console.log('🎤 ══════════════════════════════════════════════════════════');
                  onTokenReceived(token);
                } else {
                  console.log('🎤 [RX] ⚠️ Duplicate token ignored');
                }
              } else {
                console.log('🎤 [RX] ⚠️ Token too short, discarding');
              }
              
              // Reset
              state = 'IDLE';
              detectedMode = null;
              receivedChars = [];
              consecutivePreambleCount = 0;
              consecutiveGapCount = 0;
              charConfirmCount = 0;
              lastDetectedChar = null;
            } else if (tone?.type === 'char') {
              // Still hearing character, not gap yet
              consecutiveGapCount = 0;
            }
            break;
        }
      } else {
        // No signal detected
        if (state !== 'IDLE') {
          // Timeout check
          const timeSinceStateStart = now - stateStartTime;
          if (timeSinceStateStart > 2000) {
            console.log('🎤 [RX] ⚠️ Timeout in state:', state, '| resetting');
            state = 'IDLE';
            detectedMode = null;
            receivedChars = [];
            consecutivePreambleCount = 0;
            consecutiveGapCount = 0;
          }
        } else {
          consecutivePreambleCount = 0;
        }
      }

      requestAnimationFrame(processFrame);
    };

    requestAnimationFrame(processFrame);

    return () => {
      console.log('🎤 [RX] Stopping listener...');
      isListening = false;
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
      }
      if (analyser) {
        analyser.disconnect();
        analyser = null;
      }
      console.log('🎤 [RX] Stopped');
    };

  } catch (error: any) {
    console.error('🎤 [RX] Listen error:', error);
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

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
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
  console.log('🔊 [CLEANUP] Cleaning up audio resources...');
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
  console.log('🔊 [CLEANUP] Done');
}