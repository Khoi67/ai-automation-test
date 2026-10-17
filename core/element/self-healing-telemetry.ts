import fs from 'fs';
import path from 'path';

export interface HealedEvent {
  elementName: string;
  primarySelector: string;
  healedSelector: string;
  testTitle?: string;
  timestamp: string;
}

/**
 * SelfHealingTelemetry — captures and reports all runtime locator healing events.
 * Implements the "Heal & Warn" architecture principle to prevent masking real UI bugs.
 */
export class SelfHealingTelemetry {
  private static events: HealedEvent[] = [];
  private static readonly REPORT_FILE = path.resolve('test-results/self-healing-telemetry.json');

  static record(event: Omit<HealedEvent, 'timestamp'>): void {
    const fullEvent: HealedEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };
    this.events.push(fullEvent);

    // Ensure output directory exists
    const dir = path.dirname(this.REPORT_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    try {
      fs.writeFileSync(this.REPORT_FILE, JSON.stringify(this.events, null, 2), 'utf8');
    } catch {
      // Best effort telemetry recording
    }
  }

  static getEvents(): HealedEvent[] {
    return [...this.events];
  }

  static clear(): void {
    this.events = [];
  }
}
