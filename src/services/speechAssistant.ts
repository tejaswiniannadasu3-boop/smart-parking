import { soundEffects } from './soundEffects';

export interface VoiceCommandResult {
  action:
    | 'FIND_NEAREST'
    | 'SHOW_AVAILABLE'
    | 'FILTER_ZONE'
    | 'WHERE_IS_MY_SLOT'
    | 'RECOMMEND_ZONE'
    | 'BOOK_SLOT'
    | 'SHOW_TICKET'
    | 'TOGGLE_THEME'
    | 'CHECK_OCCUPANCY'
    | 'NAVIGATE'
    | 'CANCEL_BOOKING'
    | 'SHOW_MALLS'
    | 'TOGGLE_AUTO_EXTEND'
    | 'HELP'
    | 'UNKNOWN';
  param?: string;
  transcript: string;
  feedback: string;
}

class SpeechAssistantService {
  private recognition: any = null;
  private isListening: boolean = false;
  private isSupported: boolean = false;
  public voiceNotificationsEnabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
        this.isSupported = true;
      }
    }
  }

  public getIsSupported(): boolean {
    return this.isSupported;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public toggleVoiceNotifications(): boolean {
    this.voiceNotificationsEnabled = !this.voiceNotificationsEnabled;
    return this.voiceNotificationsEnabled;
  }

  public setVoiceNotificationsEnabled(enabled: boolean): void {
    this.voiceNotificationsEnabled = enabled;
  }

  public speak(text: string): Promise<void> {
    if (!this.voiceNotificationsEnabled) return Promise.resolve();
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }

  public startListening(
    onResult: (result: VoiceCommandResult) => void,
    onError?: (err: string) => void
  ) {
    if (!this.recognition) {
      if (onError) onError('Speech recognition is not supported in this browser.');
      return;
    }

    soundEffects.playVoiceChime();
    this.isListening = true;

    this.recognition.onresult = (event: any) => {
      this.isListening = false;
      const transcript = event.results[0][0].transcript.trim().toLowerCase();
      const parsed = this.parseCommand(transcript);
      this.speak(parsed.feedback);
      onResult(parsed);
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      if (onError) onError(event.error || 'Speech recognition error');
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
    } catch (e) {
      this.isListening = false;
      if (onError) onError('Microphone access could not be initialized.');
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  public parseCommand(rawText: string): VoiceCommandResult {
    const text = rawText.toLowerCase();

    // 1. "Show available slots"
    if (text.includes('show available') || text.includes('available slots') || text.includes('free slots')) {
      return {
        action: 'SHOW_AVAILABLE',
        transcript: rawText,
        feedback: 'Displaying all available parking slots in the mall map.',
      };
    }

    // 2. "Find parking in Zone B" / Zone A / Zone C / Zone D
    const zoneMatch = text.match(/zone\s*([a-d])/i);
    if (zoneMatch) {
      const zCode = zoneMatch[1].toUpperCase();
      return {
        action: 'FILTER_ZONE',
        param: zCode,
        transcript: rawText,
        feedback: `Focusing on Zone ${zCode}. Displaying bays and real-time occupancy.`,
      };
    }

    // 3. "Where is my parking slot?"
    if (text.includes('where is my') || text.includes('my parking') || text.includes('my slot')) {
      return {
        action: 'WHERE_IS_MY_SLOT',
        transcript: rawText,
        feedback: 'Locating your reserved parking bay and displaying driving directions.',
      };
    }

    // 4. "Find the nearest parking" / "Find nearest slot"
    if (
      text.includes('nearest') ||
      text.includes('closest') ||
      text.includes('find parking') ||
      text.includes('find slot')
    ) {
      return {
        action: 'FIND_NEAREST',
        transcript: rawText,
        feedback: 'Slot C03 is available and is 10 meters away from West Gate.',
      };
    }

    // 5. "Book this slot" / "Book slot"
    if (text.includes('book') || text.includes('reserve') || text.includes('park here')) {
      const match = text.match(/([a-d])\s*[-_]?\s*(\d+)/i);
      const slotParam = match ? `${match[1].toUpperCase()}${match[2].padStart(2, '0')}` : undefined;
      return {
        action: 'BOOK_SLOT',
        param: slotParam,
        transcript: rawText,
        feedback: 'Your parking slot has been successfully booked.',
      };
    }

    // 6. "Cancel my booking"
    if (text.includes('cancel') || text.includes('release') || text.includes('exit')) {
      return {
        action: 'CANCEL_BOOKING',
        transcript: rawText,
        feedback: 'Your parking booking has been cancelled.',
      };
    }

    if (text.includes('recommend') || text.includes('predict') || text.includes('best zone')) {
      return {
        action: 'RECOMMEND_ZONE',
        transcript: rawText,
        feedback: 'Analyzing occupancy patterns with Python forecast model to recommend the optimal zone.',
      };
    }

    if (text.includes('ticket') || text.includes('qr') || text.includes('pass')) {
      return {
        action: 'SHOW_TICKET',
        transcript: rawText,
        feedback: 'Retrieving your active digital parking ticket with QR code.',
      };
    }

    if (text.includes('navigate') || text.includes('direction') || text.includes('guide')) {
      return {
        action: 'NAVIGATE',
        transcript: rawText,
        feedback: 'Displaying 3D navigation route from entrance gate to your allocated slot.',
      };
    }

    if (text.includes('occupancy') || text.includes('how full') || text.includes('status')) {
      return {
        action: 'CHECK_OCCUPANCY',
        transcript: rawText,
        feedback: 'Retrieving live occupancy statistics across all four mall zones.',
      };
    }

    if (text.includes('dark') || text.includes('light') || text.includes('theme') || text.includes('mode')) {
      return {
        action: 'TOGGLE_THEME',
        transcript: rawText,
        feedback: 'Updating visual interface color theme.',
      };
    }

    if (
      text.includes('mall') ||
      text.includes('malls') ||
      text.includes('india') ||
      text.includes('switch mall') ||
      text.includes('directory')
    ) {
      return {
        action: 'SHOW_MALLS',
        transcript: rawText,
        feedback: 'Opening All Malls in India directory. You can explore and switch shopping hubs.',
      };
    }

    if (
      text.includes('auto extend') ||
      text.includes('auto-extend') ||
      text.includes('smart extend') ||
      text.includes('automatic extend')
    ) {
      return {
        action: 'TOGGLE_AUTO_EXTEND',
        transcript: rawText,
        feedback: 'Toggling Smart Auto-Extend for your parking booking.',
      };
    }

    return {
      action: 'UNKNOWN',
      transcript: rawText,
      feedback: `I heard "${rawText}". Try saying "Find the nearest parking", "Show available slots", or "Find parking in Zone B".`,
    };
  }
}

export const speechAssistant = new SpeechAssistantService();
