import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PctoComponent } from './pages/pcto/pcto.component';
import { RichiesteOrdiniComponent } from './pages/richieste-ordini/richieste-ordini.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'pcto', component: PctoComponent },
    { path: 'richieste-ordini', component: RichiesteOrdiniComponent }
];