import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AlertsComponent } from './alerts/alerts.component';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LucideAngularModule } from 'lucide-angular';
import { LoginComponent } from './login/login.component';
import { SidebarComponent } from './core/components/sidebar/sidebar.component';
import { NavbarComponent } from './core/components/navbar/navbar.component';
import { DependenciesComponent } from './dependencies/dependencies.component';
import { DependenciesModalComponent } from './dependencies/dependencies-modal/dependencies-modal.component';
import { AlteracoesHistoryComponent } from './alteracoes-history/alteracoes-history.component';
import { AddObservacaoDialogComponent } from './alteracoes-history/add-observacao-dialog/add-observacao-dialog.component';
import { ViewComparisonDialogComponent } from './alteracoes-history/view-comparison-dialog/view-comparison-dialog.component';
import { DependenciesHistoryComponent } from './dependencies-history/dependencies-history.component';
import { ViewDependencyDialogComponent } from './dependencies-history/view-dependency-dialog/view-dependency-dialog.component';
import { EditDependencyDialogComponent } from './dependencies-history/edit-dependency-dialog/edit-dependency-dialog.component';
import { NewDependencyDialogComponent } from './dependencies-history/new-dependency-dialog/new-dependency-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Bell, UserCircle, LogOut, Building2, LayoutDashboard, History, Database, Activity, Clock, Trash2, PlusCircle, Edit3, Plus, Edit, Mail, Lock, Download, Eye, DownloadCloud, Circle, X, AlertTriangle, Info, Check, CheckCircle, AlertOctagon, Search, Calendar, Filter, Link, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-angular';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    AlertsComponent,
    LoginComponent,
    SidebarComponent,
    NavbarComponent,
    DependenciesComponent,
    DependenciesModalComponent,
    AlteracoesHistoryComponent,
    AddObservacaoDialogComponent,
    ViewComparisonDialogComponent,
    DependenciesHistoryComponent,
    ViewDependencyDialogComponent,
    EditDependencyDialogComponent,
    NewDependencyDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    LucideAngularModule.pick({ Bell, UserCircle, LogOut, Building2, LayoutDashboard, History, Database, Activity, Clock, Trash2, PlusCircle, Edit3, Plus, Edit, Mail, Lock, Download, Eye, DownloadCloud, Circle, X, AlertTriangle, Info, Check, CheckCircle, AlertOctagon, Search, Calendar, Filter, Link, ChevronLeft, ChevronRight, ArrowRight }),
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatMenuModule,
    MatDividerModule,
    MatTableModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    HttpClientModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }