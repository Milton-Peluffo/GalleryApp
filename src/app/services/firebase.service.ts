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

  async getGalleryItems(): Promise<QuerySnapshot<DocumentData>> {
    try {
      return await getDocs(this.galleryCollection);
    } catch (error) {
      console.error('Error getting gallery items:', error);
      throw error;
    }
  }
}
