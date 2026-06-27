import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing-module';
import { AdminUsersPage } from './pages/users/users';
import { AuditLogPage } from './pages/audit-log/audit-log';

@NgModule({
  imports: [CommonModule, AdminRoutingModule, AdminUsersPage, AuditLogPage]
})
export class AdminModule {}
