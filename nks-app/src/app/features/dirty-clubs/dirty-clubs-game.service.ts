import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  writeBatch,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import type { DirtyClubsPlayerScore, DirtyClubsRound } from './dirty-clubs.model';

@Injectable({ providedIn: 'root' })
export class DirtyClubsGameService {
  private firestore = inject(Firestore);

  getRounds$(sessionId: string, gameId: string): Observable<DirtyClubsRound[]> {
    return new Observable<DirtyClubsRound[]>((subscriber) => {
      const ref = query(
        collection(this.firestore, `sessions/${sessionId}/games/${gameId}/rounds`),
        orderBy('handNumber'),
      );
      return onSnapshot(
        ref,
        (snap) =>
          subscriber.next(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as DirtyClubsRound)),
        (err) => subscriber.error(err),
      );
    });
  }

  async submitRound(
    sessionId: string,
    gameId: string,
    handNumber: number,
    moonWin: boolean,
    scores: Record<string, DirtyClubsPlayerScore>,
  ): Promise<void> {
    const batch = writeBatch(this.firestore);

    const roundRef = doc(
      collection(this.firestore, `sessions/${sessionId}/games/${gameId}/rounds`),
    );
    batch.set(roundRef, { handNumber, moonWin, scores });

    const gameRef = doc(this.firestore, `sessions/${sessionId}/games/${gameId}`);
    batch.update(gameRef, { currentRound: increment(1) });

    await batch.commit();
  }

  async completeGame(sessionId: string, gameId: string): Promise<void> {
    await updateDoc(doc(this.firestore, `sessions/${sessionId}/games/${gameId}`), {
      status: 'complete',
    });
  }
}
