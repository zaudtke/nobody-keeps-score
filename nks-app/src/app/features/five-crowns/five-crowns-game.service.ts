import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import type { FiveCrownsRound } from './five-crowns.model';

@Injectable({ providedIn: 'root' })
export class FiveCrownsGameService {
  private firestore = inject(Firestore);

  getRounds$(sessionId: string, gameId: string): Observable<FiveCrownsRound[]> {
    return new Observable<FiveCrownsRound[]>((subscriber) => {
      const ref = query(
        collection(this.firestore, `sessions/${sessionId}/games/${gameId}/rounds`),
        orderBy('roundNumber'),
      );
      return onSnapshot(
        ref,
        (snap) =>
          subscriber.next(
            snap.docs.map((d) => ({ id: d.id, ...d.data() }) as FiveCrownsRound),
          ),
        (err) => subscriber.error(err),
      );
    });
  }

  async confirmPlayerScore(
    sessionId: string,
    gameId: string,
    roundNumber: number,
    roundIndex: number,
    playerId: string,
    score: number,
  ): Promise<void> {
    const roundRef = doc(
      this.firestore,
      `sessions/${sessionId}/games/${gameId}/rounds/${roundNumber}`,
    );
    await setDoc(
      roundRef,
      { roundNumber, roundIndex, scores: { [playerId]: score } },
      { merge: true },
    );
  }

  async completeRound(sessionId: string, gameId: string): Promise<void> {
    await updateDoc(doc(this.firestore, `sessions/${sessionId}/games/${gameId}`), {
      currentRound: increment(1),
    });
  }

  async completeGame(sessionId: string, gameId: string): Promise<void> {
    await updateDoc(doc(this.firestore, `sessions/${sessionId}/games/${gameId}`), {
      status: 'complete',
    });
  }
}
