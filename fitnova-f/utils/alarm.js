import { Vibration, Platform } from 'react-native';

let alarmInterval = null;
let globalAudioCtx = null;

/**
 * Pre-unlock audio context on user gesture (e.g., button press)
 * to bypass browser/OS autoplay restrictions.
 */
export const unlockAudio = () => {
  try {
    if (typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        if (!globalAudioCtx || globalAudioCtx.state === 'closed') {
          globalAudioCtx = new AudioCtx();
        }
        if (globalAudioCtx.state === 'suspended') {
          globalAudioCtx.resume();
        }
      }
    }
  } catch (err) {
    console.log('Audio unlock failed:', err);
  }
};

/**
 * Play crisp alarm audio beep sequence
 */
const playBeepTone = () => {
  try {
    if (typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        if (!globalAudioCtx || globalAudioCtx.state === 'closed') {
          globalAudioCtx = new AudioCtx();
        }
        if (globalAudioCtx.state === 'suspended') {
          globalAudioCtx.resume();
        }

        const now = globalAudioCtx.currentTime;

        // Tone 1 (High Alarm Chime)
        const osc1 = globalAudioCtx.createOscillator();
        const gain1 = globalAudioCtx.createGain();
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(880, now); // A5 note
        gain1.gain.setValueAtTime(0.35, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc1.connect(gain1);
        gain1.connect(globalAudioCtx.destination);
        osc1.start(now);
        osc1.stop(now + 0.2);

        // Tone 2 (Higher Sharp Accent)
        const osc2 = globalAudioCtx.createOscillator();
        const gain2 = globalAudioCtx.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(1320, now + 0.12); // E6 note
        gain2.gain.setValueAtTime(0.4, now + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc2.connect(gain2);
        gain2.connect(globalAudioCtx.destination);
        osc2.start(now + 0.12);
        osc2.stop(now + 0.35);
      }
    }
  } catch (err) {
    console.log('Play alarm tone error:', err);
  }
};

/**
 * Start rest alarm sound and vibration
 */
export const startAlarm = () => {
  stopAlarm(); // Stop any existing alarm

  // 1. Device Vibration
  try {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      Vibration.vibrate([0, 500, 250, 500, 250, 500], true);
    } else if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([500, 250, 500, 250, 500]);
    }
  } catch (err) {
    console.log('Vibration error:', err);
  }

  // 2. Play Alarm Sound immediately and repeat every 700ms
  playBeepTone();
  alarmInterval = setInterval(() => {
    playBeepTone();
  }, 700);
};

/**
 * Stop rest alarm sound and vibration
 */
export const stopAlarm = () => {
  // Cancel vibration
  try {
    Vibration.cancel();
  } catch (_) {}

  // Clear audio chime interval
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
};
