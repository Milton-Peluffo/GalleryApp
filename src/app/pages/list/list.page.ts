import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

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
    private router: Router
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
      this.galleryItems = await this.firebaseService.getGalleryItems();
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

  navigateToAdd() {
    this.router.navigate(['/form']);
  }
}
