import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PctoComponent } from './pages/pcto/pcto.component';
import { RichiesteOrdiniComponent } from './pages/richieste-ordini/richieste-ordini.component';
import { LoginComponent } from './pages/login/login.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { OrderDetailComponent } from './pages/order-detail/order-detail.component';
import { PctoDetailComponent } from './pages/pcto-detail/pcto-detail.component';

export const routes: Routes = [
    {
        path: '', redirectTo: 'home', pathMatch: 'full'
    },
    { path: 'home', component: HomeComponent },
    { path: 'pcto', component: PctoComponent },
    { path: 'richieste-ordini', component: RichiesteOrdiniComponent },
    { path: 'admin', component: AdminDashboardComponent },
    { path: 'admin/lavori/:id', component: OrderDetailComponent },
    { path: 'admin/pcto/:id', component: PctoDetailComponent },
    { path: 'login', component: LoginComponent },
];
