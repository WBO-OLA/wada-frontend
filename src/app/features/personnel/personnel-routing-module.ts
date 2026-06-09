import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MemberList } from './pages/member-list/member-list';
import { MemberForm } from './pages/member-form/member-form';
import { MemberDetail } from './pages/member-detail/member-detail';

const routes: Routes = [
  { path: '', component: MemberList },
  { path: 'new', component: MemberForm },
  { path: ':id', component: MemberDetail },
  { path: ':id/edit', component: MemberForm },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PersonnelRoutingModule {}
