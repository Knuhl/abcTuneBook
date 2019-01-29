import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { ToastrModule } from 'ngx-toastr';

import { AppComponent } from './app.component';
import { TunebookComponent } from './tunebook/tunebook.component';
import { TuneComponent } from './tune/tune.component';
import { TunebooksListComponent } from './tunebooks-list/tunebooks-list.component';

@NgModule({
  declarations: [
    AppComponent,
    TunebookComponent,
    TuneComponent,
    TunebooksListComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    CodemirrorModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
