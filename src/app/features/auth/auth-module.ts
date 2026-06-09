import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing-module';
import { LoginPage } from './pages/login/login';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, AuthRoutingModule, LoginPage]
})
export class AuthModule {}
