import { UnauthorizedHandler, SessionEventsPort } from '../../domain/ports/auth/SessionEventsPort';

export class SessionEvents implements SessionEventsPort {
  private handlers: UnauthorizedHandler[] = [];

  onUnauthorized(handler: UnauthorizedHandler): void {
    this.handlers.push(handler);
  }

  offUnauthorized(handler: UnauthorizedHandler): void {
    this.handlers = this.handlers.filter(h => h !== handler);
  }

  emitUnauthorized(): void {
    this.handlers.forEach(h => h());
  }
}

export const sessionEvents = new SessionEvents();
