import { Component, OnInit, Inject } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { LoadingController } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ImageDetailPage } from './image-detail/image-detail.page';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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
  isFabOpen = false;

  constructor(
    private firebaseService: FirebaseService,
    private loadingCtrl: LoadingController,
    private router: Router,
    private modalCtrl: ModalController,
    @Inject('camera') private camera: typeof Camera
  ) {}

  async ngOnInit() {
    await this.loadGalleryItems();

    // Escuchar eventos de navegación para detectar cuando se vuelve a esta página después de subir una imagen
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Verificar si venimos de subir una imagen
        const navigation = this.router.getCurrentNavigation();
        if (navigation?.extras.state?.['imageUploaded']) {
          this.loadGalleryItems();
        }
      }
    });
  }

  toggleFab() {
    this.isFabOpen = !this.isFabOpen;
  }

  async openCamera() {
    const image = await this.camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });
    
    this.router.navigate(['/form'], {
      state: { image: image.base64String }
    });
  }

  async openGallery() {
    const image = await this.camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos
    });
    
    this.router.navigate(['/form'], {
      state: { image: image.base64String }
    });
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
    
    // Actualizar la lista cuando se cierre el modal, especialmente si se eliminó una imagen
    const { data } = await modal.onWillDismiss();
    if (data?.deleted) {
      await this.loadGalleryItems();
    }
  }

  navigateToAdd() {
    this.router.navigate(['/form']);
  }
}
