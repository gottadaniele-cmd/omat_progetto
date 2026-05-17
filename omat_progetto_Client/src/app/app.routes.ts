import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PctoComponent } from './pages/pcto/pcto.component';
import { RichiesteOrdiniComponent } from './pages/richieste-ordini/richieste-ordini.component';
import { LoginComponent } from './pages/login/login.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { OrderDetailComponent } from './pages/order-detail/order-detail.component';
import { PctoDetailComponent } from './pages/pcto-detail/pcto-detail.component';
import { RegisterComponent } from './pages/register/register.component';
import { requireRole } from './core/auth/role.guard';

export const routes: Routes = [
    {
        path: '', redirectTo: 'home', pathMatch: 'full'
    },
    { path: 'home', component: HomeComponent },
    { path: 'pcto', component: PctoComponent, canActivate: [requireRole(['studente'])] },
    { path: 'richieste-ordini', component: RichiesteOrdiniComponent, canActivate: [requireRole(['azienda'])] },
    { path: 'admin', component: AdminDashboardComponent, canActivate: [requireRole(['admin'])] },
    { path: 'admin/lavori/:id', component: OrderDetailComponent, canActivate: [requireRole(['admin'])] },
    { path: 'admin/pcto/:id', component: PctoDetailComponent, canActivate: [requireRole(['admin'])] },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
];
