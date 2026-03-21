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
import type { OpenScorerRound } from './open-scorer.model';

@Injectable({ providedIn: 'root' })
export class OpenScorerGameService {
  private firestore = inject(Firestore);

  getRounds$(sessionId: string, gameId: string): Observable<OpenScorerRound[]> {
    return new Observable<OpenScorerRound[]>((subscriber) => {
      const ref = query(
        collection(this.firestore, `sessions/${sessionId}/games/${gameId}/rounds`),
        orderBy('roundNumber'),
      );
      return onSnapshot(
        ref,
        (snap) =>
          subscriber.next(
            snap.docs.map((d) => ({ id: d.id, ...d.data() }) as OpenScorerRound,
          )),
        (err) => subscriber.error(err),
      );
    });
  }

  async confirmPlayerScore(
    sessionId: string,
    gameId: string,
    roundNumber: number,
    playerId: string,
    score: number,
  ): Promise<void> {
    const roundRef = doc(
      this.firestore,
      `sessions/${sessionId}/games/${gameId}/rounds/${roundNumber}`,
    );
    await setDoc(
      roundRef,
      { roundNumber, scores: { [playerId]: score } },
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
