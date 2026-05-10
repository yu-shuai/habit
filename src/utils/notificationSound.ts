export function generateNotificationSound(type: 'default' | 'gentle' | 'crystal' | 'bubble'): string {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  const configs: Record<string, { frequency: number; type: OscillatorType; duration: number; rampTime: number }> = {
    default: { frequency: 880, type: 'sine', duration: 0.3, rampTime: 0.15 },
    gentle: { frequency: 523, type: 'sine', duration: 0.5, rampTime: 0.25 },
    crystal: { frequency: 1200, type: 'triangle', duration: 0.2, rampTime: 0.1 },
    bubble: { frequency: 400, type: 'sine', duration: 0.4, rampTime: 0.2 },
  };

  const config = configs[type] || configs.default;

  oscillator.type = config.type;
  oscillator.frequency.setValueAtTime(config.frequency, audioContext.currentTime);

  if (type === 'bubble') {
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + config.duration);
  } else if (type === 'crystal') {
    oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + config.duration);
  }

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + config.duration);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + config.duration);

  return '';
}

export function playNotificationTone(type: 'default' | 'gentle' | 'crystal' | 'bubble' = 'default') {
  try {
    generateNotificationSound(type);
  } catch {}
}
