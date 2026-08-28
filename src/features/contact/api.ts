import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export async function sendContactMessage(fields: { nombre: string; correo: string; mensaje: string }) {
  await addDoc(collection(db, 'contactMessages'), {
    ...fields,
    createdAt: serverTimestamp(),
  });
}
