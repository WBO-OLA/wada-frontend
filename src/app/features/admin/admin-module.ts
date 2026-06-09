import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing-module';
import { AdminUsersPage } from './pages/users/users';

@NgModule({
  imports: [CommonModule, AdminRoutingModule, AdminUsersPage]
})
export class AdminModule {}
