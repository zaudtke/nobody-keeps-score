import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  currentUser = signal<User | null>(null);

  constructor() {
    onAuthStateChanged(this.auth, user => this.currentUser.set(user));
  }

  async signInWithGoogle(): Promise<User | null> {
    const result = await signInWithPopup(this.auth, new GoogleAuthProvider());
    return result.user;
  }

  async checkAllowlist(uid: string): Promise<boolean> {
    const snap = await getDoc(doc(this.firestore, `authorisedUsers/${uid}`));
    return snap.exists();
  }

  async signOut(): Promise<void> {
    await signOut(this.auth);
  }
}
