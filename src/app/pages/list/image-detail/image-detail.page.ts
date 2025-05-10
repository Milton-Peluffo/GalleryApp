import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

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

  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams
  ) {
    this.imageUrl = navParams.get('imageUrl');
    this.description = navParams.get('description');
    this.timestamp = navParams.get('timestamp');
  }

  ngOnInit() {
  }

  async closeModal() {
    await this.modalCtrl.dismiss();
  }
}
