import { TokenStoragePort } from '../../../domain/ports/storage/TokenStoragePort';

export class ClearSessionUseCase {
  constructor(private readonly tokenStorage: TokenStoragePort) {}

  execute(): void {
    this.tokenStorage.removeToken();
  }
}
