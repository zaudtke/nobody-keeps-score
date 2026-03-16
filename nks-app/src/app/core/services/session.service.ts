import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  docData,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Session } from '../models/session.model';
import { Game, GameType } from '../models/game.model';
import { Player } from '../models/player.model';

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

    for (let i = 0; i < playerNames.length; i++) {
      const playerRef = doc(collection(this.firestore, `sessions/${sessionRef.id}/players`));
      await setDoc(playerRef, { name: playerNames[i], order: i + 1 });
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

  getPlayers$(sessionId: string): Observable<Player[]> {
    return new Observable<Player[]>((subscriber) => {
      const ref = query(
        collection(this.firestore, `sessions/${sessionId}/players`),
        orderBy('order'),
      );
      return onSnapshot(
        ref,
        (snap) => subscriber.next(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Player)),
        (err) => subscriber.error(err),
      );
    });
  }

  getActiveGame$(sessionId: string): Observable<Game | null> {
    return new Observable<Game | null>((subscriber) => {
      const ref = query(
        collection(this.firestore, `sessions/${sessionId}/games`),
        where('status', '==', 'active'),
      );
      return onSnapshot(
        ref,
        (snap) => {
          const games = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Game);
          subscriber.next(games.length > 0 ? games[0] : null);
        },
        (err) => subscriber.error(err),
      );
    });
  }

  async getLastCompletedGame(sessionId: string): Promise<Game | null> {
    const ref = query(
      collection(this.firestore, `sessions/${sessionId}/games`),
      where('status', '==', 'complete'),
      orderBy('startedAt', 'desc'),
      limit(1),
    );
    const snap = await getDocs(ref);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as Game;
  }

  async archiveSession(sessionId: string): Promise<void> {
    await updateDoc(doc(this.firestore, `sessions/${sessionId}`), { status: 'archived' });
  }
}
