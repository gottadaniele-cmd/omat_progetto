import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PctoComponent } from './pages/pcto/pcto.component';
import { RichiesteOrdiniComponent } from './pages/richieste-ordini/richieste-ordini.component';
import { ChiSiamoComponent } from './pages/chi-siamo/chi-siamo.component';

export const routes: Routes = [
    {
        path: '', redirectTo: 'home', pathMatch: 'full'
    },
    { path: 'home', component: HomeComponent },
    { path: 'pcto', component: PctoComponent },
    { path: 'richieste-ordini', component: RichiesteOrdiniComponent },
    { path: 'chi-siamo', component: ChiSiamoComponent}
];