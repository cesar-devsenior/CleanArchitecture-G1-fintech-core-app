export type UnauthorizedHandler = () => void;

export interface SessionEventsPort {
  onUnauthorized(handler: UnauthorizedHandler): void;
  offUnauthorized(handler: UnauthorizedHandler): void;
  emitUnauthorized(): void;
}
