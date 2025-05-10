import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { Camera } from '@capacitor/camera';

import { ListPage } from './list.page';
import { ImageDetailPage } from './image-detail/image-detail.page';

const routes: Routes = [
  {
    path: '',
    component: ListPage
  },
  {
    path: 'image-detail',
    component: ImageDetailPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ListPage],
  providers: [
    { provide: 'camera', useValue: Camera }
  ]
})
export class ListPageModule {}