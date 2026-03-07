import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc,
  collection,
  setDoc,
  getDoc,
  updateDoc,
  docData,
} from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Session } from '../models/session.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);

  generateCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  async createSession(playerNames: string[]): Promise<string> {
    const code = this.generateCode();
    const hostId = this.auth.uid!;

    const sessionRef = doc(this.firestore, `sessions/${code}`);
    await setDoc(sessionRef, {
      hostId,
      createdAt: new Date(),
      status: 'active',
    });

    for (const name of playerNames) {
      const playerRef = doc(collection(this.firestore, `sessions/${code}/players`));
      await setDoc(playerRef, { name, claimedBy: null });
    }

    return code;
  }

  async joinSession(code: string): Promise<boolean> {
    const sessionRef = doc(this.firestore, `sessions/${code}`);
    const snap = await getDoc(sessionRef);
    return snap.exists();
  }

  getSession$(code: string) {
    return docData(doc(this.firestore, `sessions/${code}`), {
      idField: 'id',
    }) as Observable<Session>;
  }

  async claimPlayer(code: string, playerId: string): Promise<void> {
    const uid = this.auth.uid!;
    const playerRef = doc(this.firestore, `sessions/${code}/players/${playerId}`);
    await updateDoc(playerRef, { claimedBy: uid });
  }

  async archiveSession(code: string): Promise<void> {
    const sessionRef = doc(this.firestore, `sessions/${code}`);
    await updateDoc(sessionRef, { status: 'archived' });
  }
}
