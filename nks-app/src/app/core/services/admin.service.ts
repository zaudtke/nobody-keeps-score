import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

const STORAGE_KEY = 'nks-admin';
const EXPIRY_DAYS = 30;

@Injectable({ providedIn: 'root' })
export class AdminService {
  private _isAdmin = signal<boolean>(false);
  readonly isAdmin = this._isAdmin.asReadonly();

  init(): void {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const { expiry } = JSON.parse(raw);
      if (Date.now() < expiry) {
        this._isAdmin.set(true);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  async unlock(code: string): Promise<boolean> {
    const encoder = new TextEncoder();
    const data = encoder.encode(code);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    if (hashHex !== environment.adminCode) return false;

    const expiry = Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ expiry }));
    this._isAdmin.set(true);
    return true;
  }

  revoke(): void {
    localStorage.removeItem(STORAGE_KEY);
    this._isAdmin.set(false);
  }
}
