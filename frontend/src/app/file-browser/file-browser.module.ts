import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FileBrowserComponent } from './file-browser.component';

const routes: Routes = [
  {
    path: '',
    component: FileBrowserComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FileBrowserRoutingModule { }

@NgModule({
  imports: [FileBrowserRoutingModule],
  declarations: [],
  providers: []
})
export class FileBrowserModule { }
