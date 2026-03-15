import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  docData,
  serverTimestamp,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Session } from '../models/session.model';
import { GameType } from '../models/game.model';

export interface GameSetupConfig {
  winDirection?: 'high' | 'low';
  gameName?: string;
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);

  async createSession(
    gameType: GameType,
    config: GameSetupConfig | null,
    playerNames: string[],
  ): Promise<string> {
    const hostId = this.auth.currentUser()!.uid;
    const sessionRef = doc(collection(this.firestore, 'sessions'));

    await setDoc(sessionRef, {
      hostId,
      createdAt: serverTimestamp(),
      status: 'active',
    });

    for (const name of playerNames) {
      const playerRef = doc(collection(this.firestore, `sessions/${sessionRef.id}/players`));
      await setDoc(playerRef, { name });
    }

    const gameRef = doc(collection(this.firestore, `sessions/${sessionRef.id}/games`));
    await setDoc(gameRef, {
      gameType,
      status: 'active',
      startedAt: serverTimestamp(),
      currentRound: 1,
      config: config ?? null,
    });

    return sessionRef.id;
  }

  getSession$(sessionId: string): Observable<Session> {
    return docData(doc(this.firestore, `sessions/${sessionId}`), {
      idField: 'id',
    }) as Observable<Session>;
  }

  async archiveSession(sessionId: string): Promise<void> {
    await updateDoc(doc(this.firestore, `sessions/${sessionId}`), { status: 'archived' });
  }
}
