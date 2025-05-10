import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';
import { FirebaseService } from '../../../services/firebase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-image-detail',
  templateUrl: './image-detail.page.html',
  styleUrls: ['./image-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ImageDetailPage implements OnInit {
  imageUrl: string;
  description: string;
  timestamp: string;
  isDeleting = false;

  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private supabaseService: SupabaseService,
    private firebaseService: FirebaseService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private router: Router,
    private alertCtrl: AlertController
  ) {
    this.imageUrl = navParams.get('imageUrl');
    this.description = navParams.get('description');
    this.timestamp = navParams.get('timestamp');
  }

  ngOnInit() {}

  async closeModal() {
    await this.modalCtrl.dismiss();
  }

  async deleteImage() {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar esta imagen? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: async () => {
            this.isDeleting = true;
            const loading = await this.loadingCtrl.create({ message: 'Eliminando imagen...' });
            await loading.present();
            try {
              await this.supabaseService.deleteImage(this.imageUrl);
              await this.firebaseService.deleteGalleryItem(this.imageUrl);
              await loading.dismiss();
              const toast = await this.toastCtrl.create({ message: 'Imagen eliminada', duration: 1500, color: 'success' });
              await toast.present();
              await this.modalCtrl.dismiss({ deleted: true });
              this.router.navigate(['/list']);
            } catch (error) {
              await loading.dismiss();
              const toast = await this.toastCtrl.create({ message: 'Error al eliminar', duration: 2000, color: 'danger' });
              await toast.present();
            } finally {
              this.isDeleting = false;
            }
          },
          cssClass: 'alert-danger'
        }
      ]
    });
    await alert.present();
  }
}

