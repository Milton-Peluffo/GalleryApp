import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { SupabaseService } from '../../services/supabase.service';
import { FirebaseService } from '../../services/firebase.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-form',
  templateUrl: './form.page.html',
  styleUrls: ['./form.page.scss']
})
export class FormPage implements OnInit {
  form: FormGroup;
  imagePreview: string | null = null;
  currentDate: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private firebaseService: FirebaseService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private router: Router
  ) {
    this.form = this.fb.group({
      description: ['', Validators.required]
    });
  }

  async ngOnInit() {}

  async takePhoto() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });

    this.imagePreview = `data:image/jpeg;base64,${image.base64String}`;
  }

  async selectPhoto() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos
    });

    this.imagePreview = `data:image/jpeg;base64,${image.base64String}`;
  }

  async onSubmit() {
    if (this.form.invalid || !this.imagePreview) {
      this.showToast('Por favor, completa todos los campos');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Guardando...'
    });
    await loading.present();

    try {
      const blob = await this.dataURLToBlob(this.imagePreview);
      const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });

      const imageUrl = await this.supabaseService.uploadImage(file);
      if (!imageUrl) {
        throw new Error('Error subiendo la imagen');
      }

      await this.firebaseService.saveGalleryItem(
        this.form.value.description,
        imageUrl
      );

      this.showToast('Imagen guardada exitosamente');
      this.form.reset();
      this.imagePreview = null;
      await this.router.navigate(['/list']);
    } catch (error) {
      console.error('Error:', error);
      this.showToast('Error guardando la imagen');
    } finally {
      await loading.dismiss();
    }
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000
    });
    await toast.present();
  }

  private dataURLToBlob(dataURL: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const parts = dataURL.split(';');
        if (parts.length < 2) {
          throw new Error('Invalid data URL format');
        }
        
        const contentType = parts[0].split(':')[1];
        if (!contentType) {
          throw new Error('Invalid content type');
        }
        
        const base64Data = parts.pop()?.split(',')[1];
        if (!base64Data) {
          throw new Error('Invalid base64 data');
        }
        
        const raw = window.atob(base64Data);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);

        for (let i = 0; i < rawLength; i++) {
          uInt8Array[i] = raw.charCodeAt(i);
        }

        resolve(new Blob([uInt8Array], { type: contentType }));
      } catch (error) {
        reject(error);
      }
    });
  }
}
