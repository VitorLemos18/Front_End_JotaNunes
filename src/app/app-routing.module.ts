import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AlertsComponent } from './alerts/alerts.component';
import { DependenciesHistoryComponent } from './dependencies-history/dependencies-history.component';
import { AlteracoesHistoryComponent } from './alteracoes-history/alteracoes-history.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'alerts', component: AlertsComponent, canActivate: [AuthGuard] },
  { path: 'dependencies-history', component: DependenciesHistoryComponent, canActivate: [AuthGuard] },
  { path: 'alteracoes-history', component: AlteracoesHistoryComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }