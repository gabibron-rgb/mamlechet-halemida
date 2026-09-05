export type GameSoundId =
  | 'boxCommon'
  | 'boxUncommon'
  | 'boxRare'
  | 'boxEpic'
  | 'boxLegendary'
  | 'levelUp'
  | 'evolution'
  | 'trophy'
  | 'achievement'
  | 'soundOn';

const STORAGE_KEY = 'mamlechet:sound-enabled';

let audioContext: AudioContext | null = null;

export function isGameSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;

  try {
    return window.localStorage.getItem(STORAGE_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setGameSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
  } catch {
    // Sound preference should never block the game.
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined' || typeof AudioContext === 'undefined') {
    return null;
  }

  if (!audioContext) {
    try {
      audioContext = new AudioContext();
    } catch {
      return null;
    }
  }

  return audioContext;
}

type Note = {
  frequency: number;
  at: number;
  duration: number;
  gain?: number;
  type?: OscillatorType;
};

function playNotes(notes: Note[]): void {
  if (!isGameSoundEnabled()) return;

  const context = getAudioContext();
  if (!context) return;

  const play = () => {
    const baseTime = context.currentTime + 0.012;

    for (const note of notes) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = baseTime + note.at;
      const end = start + note.duration;
      const peak = note.gain ?? 0.034;

      oscillator.type = note.type ?? 'sine';
      oscillator.frequency.setValueAtTime(note.frequency, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(peak, start + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(end + 0.02);
    }
  };

  if (context.state === 'suspended') {
    void context.resume().then(play).catch(() => undefined);
  } else {
    play();
  }
}

export function playGameSound(sound: GameSoundId): void {
  switch (sound) {
    case 'boxCommon':
      playNotes([
        { frequency: 620, at: 0, duration: 0.10, gain: 0.024 },
      ]);
      break;

    case 'boxUncommon':
      playNotes([
        { frequency: 620, at: 0, duration: 0.10, gain: 0.025 },
        { frequency: 760, at: 0.075, duration: 0.12, gain: 0.025 },
      ]);
      break;

    case 'boxRare':
      playNotes([
        { frequency: 660, at: 0, duration: 0.12, gain: 0.028 },
        { frequency: 880, at: 0.09, duration: 0.15, gain: 0.029 },
      ]);
      break;

    case 'boxEpic':
      playNotes([
        { frequency: 620, at: 0, duration: 0.13, gain: 0.030 },
        { frequency: 820, at: 0.085, duration: 0.14, gain: 0.031 },
        { frequency: 1040, at: 0.17, duration: 0.18, gain: 0.030 },
      ]);
      break;

    case 'boxLegendary':
      playNotes([
        { frequency: 523.25, at: 0, duration: 0.15, gain: 0.032 },
        { frequency: 659.25, at: 0.09, duration: 0.16, gain: 0.033 },
        { frequency: 783.99, at: 0.18, duration: 0.17, gain: 0.034 },
        { frequency: 1046.5, at: 0.28, duration: 0.22, gain: 0.031 },
      ]);
      break;

    case 'levelUp':
      playNotes([
        { frequency: 523.25, at: 0, duration: 0.14, gain: 0.030 },
        { frequency: 659.25, at: 0.10, duration: 0.14, gain: 0.031 },
        { frequency: 783.99, at: 0.20, duration: 0.20, gain: 0.031 },
      ]);
      break;

    case 'evolution':
      playNotes([
        { frequency: 392, at: 0, duration: 0.16, gain: 0.028 },
        { frequency: 523.25, at: 0.12, duration: 0.17, gain: 0.030 },
        { frequency: 659.25, at: 0.24, duration: 0.18, gain: 0.030 },
        { frequency: 783.99, at: 0.37, duration: 0.23, gain: 0.029 },
      ]);
      break;

    case 'trophy':
      playNotes([
        { frequency: 659.25, at: 0, duration: 0.14, gain: 0.030 },
        { frequency: 783.99, at: 0.10, duration: 0.14, gain: 0.031 },
        { frequency: 987.77, at: 0.20, duration: 0.20, gain: 0.030 },
      ]);
      break;

    case 'achievement':
      playNotes([
        { frequency: 740, at: 0, duration: 0.12, gain: 0.027 },
        { frequency: 932.33, at: 0.10, duration: 0.18, gain: 0.028 },
      ]);
      break;

    case 'soundOn':
      playNotes([
        { frequency: 720, at: 0, duration: 0.09, gain: 0.022 },
        { frequency: 900, at: 0.07, duration: 0.11, gain: 0.021 },
      ]);
      break;
  }
}

export function playBoxRewardSound(
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
): void {
  const soundByRarity: Record<typeof rarity, GameSoundId> = {
    common: 'boxCommon',
    uncommon: 'boxUncommon',
    rare: 'boxRare',
    epic: 'boxEpic',
    legendary: 'boxLegendary',
  };

  playGameSound(soundByRarity[rarity]);
}
