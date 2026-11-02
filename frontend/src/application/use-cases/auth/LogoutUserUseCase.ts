import { TokenStoragePort } from '../../../domain/ports/storage/TokenStoragePort';

export class LogoutUserUseCase {
  constructor(private readonly tokenStorage: TokenStoragePort) {}

  execute(): void {
    this.tokenStorage.removeToken();
  }
}
