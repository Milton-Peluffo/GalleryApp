import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: any;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );
  }

  async uploadImage(file: string): Promise<string> {
    try {
      // Convert base64 to blob
      const blob = await this.dataURLToBlob(file);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;

      // Upload to Supabase
      const { data, error } = await this.supabase.storage
        .from('gallery')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error('Error uploading image');
      }

      // Get public URL
      const { data: { publicUrl } } = await this.supabase.storage
        .from('gallery')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  private async dataURLToBlob(dataURL: string): Promise<Blob> {
    const base64Response = dataURL.split(',')[1];
    const byteCharacters = atob(base64Response);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'image/jpeg' });
  }
}
