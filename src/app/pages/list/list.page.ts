import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ImageDetailPage } from './image-detail/image-detail.page';

@Component({
  standalone: false,
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss']
})
export class ListPage implements OnInit {
  galleryItems: any[] = [];
  isModalOpen = false;
  selectedImage: any | null = null;

  constructor(
    private firebaseService: FirebaseService,
    private loadingCtrl: LoadingController,
    private router: Router,
    private modalCtrl: ModalController
  ) {}

  async ngOnInit() {
    await this.loadGalleryItems();
  }

  private async loadGalleryItems() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando imágenes...'
    });
    await loading.present();

    try {
      const querySnapshot = await this.firebaseService.getGalleryItems();
      this.galleryItems = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error loading gallery items:', error);
    } finally {
      await loading.dismiss();
    }
  }

  openImageDetail(image: any) {
    this.selectedImage = image;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedImage = null;
  }

  async viewImage(imageUrl: string, description: string, timestamp: string) {
    const modal = await this.modalCtrl.create({
      component: ImageDetailPage,
      componentProps: {
        imageUrl: imageUrl,
        description: description,
        timestamp: timestamp
      }
    });

    await modal.present();
  }

  navigateToAdd() {
    this.router.navigate(['/form']);
  }
}
