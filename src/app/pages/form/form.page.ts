import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import { SupabaseService } from '../../services/supabase.service';
import { FirebaseService } from '../../services/firebase.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-form',
  templateUrl: './form.page.html',
  styleUrls: ['./form.page.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, IonicModule, CommonModule, RouterModule]
})
export class FormPage implements OnInit {
  form: FormGroup;
  imagePreview: string | null = null;
  currentDate: string;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertController: AlertController,
    private toastCtrl: ToastController,
    private supabaseService: SupabaseService,
    private firebaseService: FirebaseService
  ) {
    this.form = this.formBuilder.group({
      description: ['', Validators.required]
    });
    this.currentDate = new Date().toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      const toast = await this.toastCtrl.create({
        message: 'Por favor, completa todos los campos',
        duration: 2000,
        position: 'top'
      });
      await toast.present();
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Subiendo imagen...'
    });

    await loading.present();

    try {
      const imageUrl = await this.supabaseService.uploadImage(this.imagePreview);
      if (!imageUrl) {
        throw new Error('Error subiendo la imagen');
      }

      await this.firebaseService.saveGalleryItem(
        this.form.value.description,
        imageUrl
      );

      const toast = await this.toastCtrl.create({
        message: 'Imagen guardada exitosamente',
        duration: 2000,
        position: 'top'
      });
      await toast.present();

      this.form.reset();
      this.imagePreview = null;
      await this.router.navigate(['/list']);
    } catch (error) {
      console.error('Error:', error);
      const toast = await this.toastCtrl.create({
        message: error instanceof Error ? error.message : 'Error guardando la imagen',
        duration: 2000,
        position: 'top',
        color: 'danger'
      });
      await toast.present();
    } finally {
      loading.dismiss();
    }
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
