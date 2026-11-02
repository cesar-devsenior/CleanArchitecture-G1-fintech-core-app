import { TokenStoragePort } from '../../../domain/ports/storage/TokenStoragePort';

export class PersistSessionUseCase {
  constructor(private readonly tokenStorage: TokenStoragePort) {}

  execute(token: string): void {
    this.tokenStorage.setToken(token);
  }
}
