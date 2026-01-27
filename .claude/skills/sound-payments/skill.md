# Sound Payments (SoundPay)

## Overview

SoundPay uses a custom FSK (Frequency Shift Keying) protocol called "BOMBPROOF" to transmit payment tokens as audio frequencies between devices. The POS broadcasts a payment ID encoded as audio tones, and the customer's device listens, decodes, and completes the payment.

## End-to-End Flow

```
POS (Sender)                              Customer (Receiver)
─────────────                             ──────────────────
1. Create payment link
2. Extract token (last 4 hex chars)
3. Broadcast audio tones ──────────────→  4. Microphone captures audio
                                          5. FFT detects frequencies
                                          6. Decode token from tones
                                          7. GET /p/{token}?sid={soundId}
                                          8. Payment processed on XRPL
   ←──────────────────────────────────    9. tx_hash returned
10. Poll confirms status = 'paid'
11. Show receipt                          11. Show confirmation
```

## Audio Protocol

### Frequency Configuration

Located in `utils/soundPayment.ts`:

**Audible Mode (lines 70-76):**
| Signal | Frequency |
|--------|-----------|
| Preamble | 16500 Hz |
| Gap Tone | 16750 Hz |
| Base (char 0) | 17000 Hz |
| Freq Step | +80 Hz per char |
| Char Range | 17000-17280 Hz (0-F) |
| Postamble | 18500 Hz |

**Ultrasound Mode (lines 62-68):**
| Signal | Frequency |
|--------|-----------|
| Preamble | 17500 Hz |
| Gap Tone | 17650 Hz |
| Base (char 0) | 17800 Hz |
| Freq Step | +30 Hz per char |
| Postamble | 19500 Hz |

### Timing (lines 22-38)
- Preamble duration: 200ms
- Character duration: 120ms
- Gap duration: 60ms
- Attack/Release envelope: 5ms
- Sample rate: 48000 Hz

### Transmission Format
```
[PREAMBLE 200ms] → [GAP 60ms] → [CHAR1 120ms] → [GAP 60ms] → [CHAR2 120ms] → ... → [POSTAMBLE 200ms]
```

### Character Encoding (lines 79-103)
- Charset: `0123456789ABCDEF` (hex only)
- Each character maps to a specific frequency
- Frequency tolerance: 50 Hz (audible), 100 Hz (ultrasound)
- Minimum token length: 4 characters

## Key Functions (utils/soundPayment.ts)

### `broadcastToken()` (lines 195-287)
Creates oscillators for each frequency, applies gain envelopes, schedules playback via AudioContext.

### `startListening()` (lines 294-645)
Uses FFT (size 8192, ~5.86 Hz resolution) with a state machine in `requestAnimationFrame`:
- **IDLE** → waiting for preamble (3 consecutive detections required)
- **PREAMBLE_DETECTED** → locked on sync
- **WAITING_FOR_CHAR** → sampling 50ms into character slots
- **WAITING_FOR_GAP** → expecting separator tone
- **COMPLETE** → postamble detected or 4+ chars with multiple gaps
- **Timeout** → 2 seconds without signal resets to IDLE

## Components

### SoundPay.tsx (480 lines)
Main component with send/receive toggle.

**Props (lines 7-14):**
```typescript
paymentId: string
amount: number
storeName: string
tipAmount?: number
onSuccess?: (txHash: string) => void
onError?: (error: string) => void
```

**Retry Strategy (lines 93-138):**
Three attempts with increasing tone/silence durations:
```typescript
attempts = [
  { volume: 1.0, toneDuration: 0.08, silenceDuration: 0.03 },  // Fast
  { volume: 1.0, toneDuration: 0.10, silenceDuration: 0.04 },  // Medium
  { volume: 1.0, toneDuration: 0.12, silenceDuration: 0.05 },  // Slow/robust
]
```
Each attempt: broadcast → poll backend every 500ms for 8 seconds.

### SoundPayButton.tsx
Sender button for POS — creates payment link, then broadcasts token.

### SoundPaySend.tsx
Advanced sender with detailed retry logic and status display.

### SoundPaymentPage.tsx (514 lines)
Dedicated customer listening/payment page.

**Props (lines 13-21):**
```typescript
store_name, store_id, store_logo
amount, tip, items, rlusd_amount
currency, vendor_wallet
```

### SoundPaymentConfirm.tsx
Confirmation modal after successful detection.

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/nfc/api/v1/payment-link/create` | POST | Create payment (with `payment_type: 'soundpay'`) |
| `/nfc/api/v1/payment-link/{id}` | GET | Poll status (every 500ms) |
| `/nfc/api/v1/payment-link/{id}/tip` | POST | Save tip before processing |
| `/nfc/api/v1/p/{token}?sid={soundId}` | GET | Customer completes payment |
| `/nfc/api/v1/sound/device-by-wallet/{wallet}` | GET | Get device sound ID |
| `/nfc/api/v1/sound/register` | POST | Register sound device |

## Device Registration

Before SoundPay can work, the device must be registered:
- `GET /nfc/api/v1/sound/device-by-wallet/{wallet}` checks if registered
- `POST /nfc/api/v1/sound/register` creates a new device entry
- Sound ID stored in localStorage: `yesallofus_sound_id` and `yesallofus_sound_secret`

## Error Handling

| Error | Cause | Handling |
|-------|-------|----------|
| "Sound not available" | AudioContext not supported | Show error UI |
| "Microphone permission denied" | User blocked mic | Show permission prompt |
| "Payment failed after 3 attempts" | All retries exhausted | Show retry button |
| "Enable Tap-to-Pay first" | No sound_id for device | Redirect to settings |

## Logging

Console logging uses emoji prefixes:
- `🔊` = Transmitter (TX)
- `🎤` = Receiver (RX)
- `💰` = Tip operation
- `🧾` = Receipt

## Key Files

| File | Role |
|------|------|
| `utils/soundPayment.ts` | Core BOMBPROOF FSK audio engine |
| `components/SoundPay.tsx` | Main component (send/receive) |
| `components/SoundPayButton.tsx` | POS sender button |
| `components/SoundPaySend.tsx` | Advanced sender with retries |
| `components/SoundPaymentPage.tsx` | Customer listening page |
| `components/SoundPaymentConfirm.tsx` | Confirmation modal |
| `public/ggwave-processor.js` | AudioWorkletProcessor (legacy) |
