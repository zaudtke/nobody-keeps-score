import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  docData,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Session } from '../models/session.model';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);

  async createSession(playerNames: string[]): Promise<string> {
    const hostId = this.auth.currentUser()!.uid;
    const sessionRef = doc(collection(this.firestore, 'sessions'));

    await setDoc(sessionRef, {
      hostId,
      createdAt: new Date(),
      status: 'active',
    });

    for (const name of playerNames) {
      const playerRef = doc(collection(this.firestore, `sessions/${sessionRef.id}/players`));
      await setDoc(playerRef, { name });
    }

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
