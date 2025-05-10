import { Injectable } from '@angular/core';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../firebase';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private galleryCollection = collection(db, 'gallery');

  async saveGalleryItem(description: string, imageUrl: string) {
    try {
      const timestamp = new Date().toISOString();
      await addDoc(this.galleryCollection, {
        description,
        imageUrl,
        timestamp
      });
    } catch (error) {
      console.error('Error saving gallery item:', error);
      throw error;
    }
  }

  async deleteGalleryItem(imageUrl: string): Promise<void> {
    try {
      // Buscar el documento por imageUrl
      const q = query(this.galleryCollection);
      const snapshot = await getDocs(q);
      const docToDelete = snapshot.docs.find(docSnap => docSnap.data()['imageUrl'] === imageUrl);
      if (!docToDelete) {
        throw new Error('No se encontró el documento para eliminar.');
      }
      const { deleteDoc, doc } = await import('firebase/firestore');
      await deleteDoc(doc(this.galleryCollection.firestore, this.galleryCollection.path, docToDelete.id));
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      throw error;
    }
  }

  async getGalleryItems(): Promise<QuerySnapshot<DocumentData>> {
    try {
      return await getDocs(this.galleryCollection);
    } catch (error) {
      console.error('Error getting gallery items:', error);
      throw error;
    }
  }
}
