import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { ClientLibModule } from '@board-game-companion-app/client-lib';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment.prod';
import { NbThemeModule, NbMenuModule } from '@nebular/theme';
import { SharedModule } from '@board-game-companion-app/client-lib';
import { DragulaModule } from 'ng2-dragula';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
const config: SocketIoConfig = { url: 'https://board-game-companion-app.herokuapp.com', options: {} };

@NgModule({
  declarations: [AppComponent],
  imports: [
    NbThemeModule.forRoot(),
    DragulaModule.forRoot(),
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    HttpClientModule,
    AppRoutingModule,
    ClientLibModule,
    NbMenuModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000',
    }),
    SocketIoModule.forRoot(config)
  ],
  providers: [HttpClient],
  bootstrap: [AppComponent],
})
export class AppModule {}
