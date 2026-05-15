import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SessionService } from './session.service';
import { UserProfile } from './user-profile.model';
// Lazy-load Supabase only in browser to avoid SSR build issues
let supabaseClient: any = null;
async function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  const { createClient } = await import('@supabase/supabase-js');
  supabaseClient = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  return supabaseClient;
}
@Injectable({ providedIn: 'root' })
export class AuthService {
  private session = inject(SessionService);
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private isBrowser = isPlatformBrowser(this.platformId);
  private profileSignal = signal<UserProfile | null>(null);
  async signIn(email: string, password: string) {
    if (!this.isBrowser) throw new Error('signIn: browser context required');
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const access = data.session?.access_token ?? null;
    const refresh = data.session?.refresh_token ?? null;
    this.session.setSession(access, refresh);
    if (access) await this.loadProfile();
    return data;
  }
  /**
   * signUp with optional user metadata.
   * Many Supabase projects use auth triggers that read user_metadata to
   * create a profile row in the database. Passing metadata avoids null
   * constraint violations (e.g. nombre NOT NULL).
   */
  async signUp(email: string, password: string, userMetadata?: Record<string, unknown>) {
    if (!this.isBrowser) throw new Error('signUp: browser context required');
    const supabase = await getSupabaseClient();
    
    // Build payload with explicit options structure
    const payload: any = { 
      email, 
      password,
      options: {
        data: userMetadata || {}
      }
    };
    
    const { data, error } = await supabase.auth.signUp(payload);
    if (error) throw error;
    const access = (data as any).session?.access_token ?? null;
    const refresh = (data as any).session?.refresh_token ?? null;
    if (access) this.session.setSession(access, refresh);
    if (access) await this.loadProfile();
    return data;
  }
  async signOut() {
    if (!this.isBrowser) return;
    const supabase = await getSupabaseClient();
    await supabase.auth.signOut();
    this.session.clearSession();
    this.clearProfile();
  }
  async getUser() {
    if (!this.isBrowser) {
      return Promise.resolve({ data: { user: null }, error: new Error('getUser: browser only') });
    }
    const supabase = await getSupabaseClient();
    return supabase.auth.getUser();
  }

  get profile() {
    return this.profileSignal.asReadonly();
  }

  async loadProfile() {
    if (!this.isBrowser) return null;
    if (!this.session.isAuthenticated()) {
      this.profileSignal.set(null);
      return null;
    }

    const profile = await this.http.get<UserProfile>(`${environment.apiBaseUrl}/api/auth/me`).toPromise();
    this.profileSignal.set(profile ?? null);
    return profile ?? null;
  }

  async ensureProfileLoaded() {
    if (this.profileSignal()) return this.profileSignal();
    return this.loadProfile();
  }

  isAdmin(): boolean {
    return (this.profileSignal()?.rol ?? '').toUpperCase() === 'ADMIN';
  }

  hasRole(role: string): boolean {
    return (this.profileSignal()?.rol ?? '').toUpperCase() === role.toUpperCase();
  }

  async refreshSessionIfNeeded() {
    if (!this.isBrowser) throw new Error('refreshSessionIfNeeded: browser context required');
    const supabase = await getSupabaseClient();
    
    // Try to refresh session
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    
    // Update session with new tokens
    const access = (data as any).session?.access_token ?? null;
    const refresh = (data as any).session?.refresh_token ?? null;
    if (access) {
      this.session.setSession(access, refresh);
    }
    
    return data;
  }

  clearProfile() {
    this.profileSignal.set(null);
  }
}
