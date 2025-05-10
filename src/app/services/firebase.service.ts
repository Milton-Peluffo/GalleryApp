import { Injectable } from '@angular/core';
import { collection, addDoc, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private galleryCollection = collection(db, 'gallery');

  async saveGalleryItem(description: string, imageUrl: string) {
    try {
      await addDoc(this.galleryCollection, {
        description,
        imageUrl,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error saving gallery item:', error);
      throw error;
    }
  }

  async getGalleryItems(): Promise<any[]> {
    try {
      const q = query(this.galleryCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting gallery items:', error);
      return [];
    }
  }
}
