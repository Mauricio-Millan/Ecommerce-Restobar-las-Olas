import { Injectable, inject } from '@angular/core';
import { SessionService } from './session.service';
// MOCK: Simulated auth without Supabase for testing
@Injectable({ providedIn: 'root' })
export class AuthService {
  private session = inject(SessionService);
  async signIn(email: string, password: string) {
    console.log('[MOCK AUTH] signIn called with:', email);
    // Simulate successful login with mock token
    const mockToken = 'mock-token-' + Date.now();
    this.session.setSession(mockToken, 'mock-refresh');
    return { user: { email }, session: { access_token: mockToken } };
  }
  async signUp(email: string, password: string) {
    console.log('[MOCK AUTH] signUp called with:', email);
    const mockToken = 'mock-token-' + Date.now();
    this.session.setSession(mockToken, 'mock-refresh');
    return { user: { email }, session: { access_token: mockToken } };
  }
  async signOut() {
    console.log('[MOCK AUTH] signOut called');
    this.session.clearSession();
  }
  async getUser() {
    console.log('[MOCK AUTH] getUser called');
    return { data: { user: null }, error: null };
  }
}
